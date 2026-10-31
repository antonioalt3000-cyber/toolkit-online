// Runs real Lua (via fengari, a pure-JS Lua 5.3 VM) against the in-memory
// RedisEngine, so @upstash/ratelimit's actual EVAL scripts execute with
// correct semantics instead of being special-cased/guessed.
//
// Uses only raw fengari lapi primitives (no fengari-interop): interop's JS
// bridge builds 0-indexed JS-proxy tables, which breaks native Lua 1-based
// indexing (KEYS[1]/ARGV[1]) used by real Redis scripts. Native Lua tables
// built with lua_newtable/lua_rawseti behave correctly instead.
'use strict';

const { lua, lauxlib, lualib, to_luastring } = require('fengari');

function pushLuaValue(L, v) {
  if (v === null || v === undefined) {
    lua.lua_pushboolean(L, false); // Redis nil -> Lua false
  } else if (typeof v === 'number') {
    lua.lua_pushnumber(L, v);
  } else if (typeof v === 'string') {
    lua.lua_pushstring(L, to_luastring(v));
  } else if (Array.isArray(v)) {
    lua.lua_newtable(L);
    v.forEach((item, i) => {
      pushLuaValue(L, item);
      lua.lua_rawseti(L, -2, i + 1);
    });
  } else {
    lua.lua_pushboolean(L, false);
  }
}

// Reads the Lua value at stack index `idx` into a plain JS value.
function readLuaValue(L, idx) {
  const t = lua.lua_type(L, idx);
  switch (t) {
    case lua.LUA_TNIL:
      return null;
    case lua.LUA_TBOOLEAN:
      return lua.lua_toboolean(L, idx) ? 1 : null; // Lua->Redis: true=1, false=nil
    case lua.LUA_TNUMBER:
      return lua.lua_tonumber(L, idx);
    case lua.LUA_TSTRING:
      return lua.lua_tojsstring(L, idx);
    case lua.LUA_TTABLE: {
      const out = [];
      const abs = idx < 0 ? lua.lua_gettop(L) + idx + 1 : idx;
      for (let i = 1; ; i++) {
        lua.lua_rawgeti(L, abs, i);
        if (lua.lua_type(L, -1) === lua.LUA_TNIL) {
          lua.lua_pop(L, 1);
          break;
        }
        out.push(readLuaValue(L, -1));
        lua.lua_pop(L, 1);
      }
      return out;
    }
    default:
      return null;
  }
}

function makeRedisCallFn(engine, { catchErrors }) {
  return (L) => {
    const n = lua.lua_gettop(L);
    const cmdArr = [];
    for (let i = 1; i <= n; i++) {
      if (lua.lua_type(L, i) === lua.LUA_TNUMBER) cmdArr.push(lua.lua_tonumber(L, i));
      else cmdArr.push(lua.lua_tojsstring(L, i));
    }
    if (catchErrors) {
      try {
        pushLuaValue(L, engine.dispatch(cmdArr));
      } catch (e) {
        lua.lua_newtable(L);
        lua.lua_pushstring(L, to_luastring(String(e.message || e)));
        lua.lua_setfield(L, -2, to_luastring('err'));
      }
    } else {
      pushLuaValue(L, engine.dispatch(cmdArr));
    }
    return 1;
  };
}

function runEval(engine, script, keys, args) {
  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

  pushLuaValue(L, keys.map(String));
  lua.lua_setglobal(L, to_luastring('KEYS'));
  pushLuaValue(
    L,
    args.map((a) => (typeof a === 'number' ? a : String(a)))
  );
  lua.lua_setglobal(L, to_luastring('ARGV'));

  lua.lua_newtable(L); // the `redis` table
  lua.lua_pushjsfunction(L, makeRedisCallFn(engine, { catchErrors: false }));
  lua.lua_setfield(L, -2, to_luastring('call'));
  lua.lua_pushjsfunction(L, makeRedisCallFn(engine, { catchErrors: true }));
  lua.lua_setfield(L, -2, to_luastring('pcall'));
  lua.lua_setglobal(L, to_luastring('redis'));

  const status = lauxlib.luaL_dostring(L, to_luastring(script));
  if (status !== lua.LUA_OK) {
    const err = lua.lua_tojsstring(L, -1);
    throw new Error(`Lua error: ${err}`);
  }
  if (lua.lua_gettop(L) === 0) return null;
  return readLuaValue(L, -1);
}

module.exports = { runEval };
