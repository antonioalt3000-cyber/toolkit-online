'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tools, type Locale } from '@/lib/translations';
import ToolPageWrapper from '@/components/ToolPageWrapper';

type EmojiEntry = { emoji: string; name: string; category: string; skinToneBase?: boolean };

const SKIN_TONES = [
  { modifier: '', label: 'Default' },
  { modifier: '\u{1F3FB}', label: 'Light' },
  { modifier: '\u{1F3FC}', label: 'Medium-Light' },
  { modifier: '\u{1F3FD}', label: 'Medium' },
  { modifier: '\u{1F3FE}', label: 'Medium-Dark' },
  { modifier: '\u{1F3FF}', label: 'Dark' },
];

const EMOJI_DATA: EmojiEntry[] = [
  // Smileys (30)
  { emoji: '\u{1F600}', name: 'grinning face', category: 'smileys' },
  { emoji: '\u{1F603}', name: 'smiling face open mouth', category: 'smileys' },
  { emoji: '\u{1F604}', name: 'smiling face smiling eyes', category: 'smileys' },
  { emoji: '\u{1F601}', name: 'beaming face smiling eyes', category: 'smileys' },
  { emoji: '\u{1F606}', name: 'grinning squinting face', category: 'smileys' },
  { emoji: '\u{1F605}', name: 'grinning face sweat', category: 'smileys' },
  { emoji: '\u{1F923}', name: 'rolling on floor laughing', category: 'smileys' },
  { emoji: '\u{1F602}', name: 'face tears of joy', category: 'smileys' },
  { emoji: '\u{1F642}', name: 'slightly smiling face', category: 'smileys' },
  { emoji: '\u{1F643}', name: 'upside down face', category: 'smileys' },
  { emoji: '\u{1F609}', name: 'winking face', category: 'smileys' },
  { emoji: '\u{1F60A}', name: 'smiling face blushing', category: 'smileys' },
  { emoji: '\u{1F607}', name: 'smiling face halo angel', category: 'smileys' },
  { emoji: '\u{1F60D}', name: 'heart eyes love', category: 'smileys' },
  { emoji: '\u{1F929}', name: 'star struck excited', category: 'smileys' },
  { emoji: '\u{1F618}', name: 'face blowing kiss', category: 'smileys' },
  { emoji: '\u{1F617}', name: 'kissing face', category: 'smileys' },
  { emoji: '\u{1F61A}', name: 'kissing face closed eyes', category: 'smileys' },
  { emoji: '\u{1F60B}', name: 'face savoring food yum', category: 'smileys' },
  { emoji: '\u{1F61B}', name: 'face tongue out', category: 'smileys' },
  { emoji: '\u{1F61C}', name: 'winking face tongue', category: 'smileys' },
  { emoji: '\u{1F92A}', name: 'zany face crazy', category: 'smileys' },
  { emoji: '\u{1F914}', name: 'thinking face hmm', category: 'smileys' },
  { emoji: '\u{1F928}', name: 'face raised eyebrow', category: 'smileys' },
  { emoji: '\u{1F610}', name: 'neutral face', category: 'smileys' },
  { emoji: '\u{1F611}', name: 'expressionless face', category: 'smileys' },
  { emoji: '\u{1F636}', name: 'face without mouth', category: 'smileys' },
  { emoji: '\u{1F60F}', name: 'smirking face', category: 'smileys' },
  { emoji: '\u{1F612}', name: 'unamused face', category: 'smileys' },
  { emoji: '\u{1F644}', name: 'face rolling eyes', category: 'smileys' },
  { emoji: '\u{1F62C}', name: 'grimacing face', category: 'smileys' },
  { emoji: '\u{1F925}', name: 'lying face pinocchio', category: 'smileys' },
  { emoji: '\u{1F60C}', name: 'relieved face', category: 'smileys' },
  { emoji: '\u{1F614}', name: 'pensive face sad', category: 'smileys' },
  { emoji: '\u{1F62A}', name: 'sleepy face', category: 'smileys' },
  { emoji: '\u{1F924}', name: 'drooling face', category: 'smileys' },
  { emoji: '\u{1F634}', name: 'sleeping face zzz', category: 'smileys' },
  { emoji: '\u{1F637}', name: 'face medical mask sick', category: 'smileys' },
  { emoji: '\u{1F912}', name: 'face thermometer fever', category: 'smileys' },
  { emoji: '\u{1F915}', name: 'face head bandage hurt', category: 'smileys' },
  { emoji: '\u{1F922}', name: 'nauseated face sick', category: 'smileys' },
  { emoji: '\u{1F92E}', name: 'vomiting face', category: 'smileys' },
  { emoji: '\u{1F927}', name: 'sneezing face', category: 'smileys' },
  { emoji: '\u{1F975}', name: 'hot face overheated', category: 'smileys' },
  { emoji: '\u{1F976}', name: 'cold face freezing', category: 'smileys' },
  { emoji: '\u{1F974}', name: 'woozy face dizzy drunk', category: 'smileys' },
  { emoji: '\u{1F635}', name: 'dizzy face knocked out', category: 'smileys' },
  { emoji: '\u{1F621}', name: 'pouting face angry', category: 'smileys' },
  { emoji: '\u{1F620}', name: 'angry face mad', category: 'smileys' },
  { emoji: '\u{1F92F}', name: 'exploding head mind blown', category: 'smileys' },
  { emoji: '\u{1F622}', name: 'crying face sad tear', category: 'smileys' },
  { emoji: '\u{1F62D}', name: 'loudly crying face', category: 'smileys' },
  { emoji: '\u{1F631}', name: 'face screaming fear', category: 'smileys' },
  { emoji: '\u{1F628}', name: 'fearful face scared', category: 'smileys' },
  { emoji: '\u{1F630}', name: 'anxious face sweat', category: 'smileys' },
  { emoji: '\u{1F625}', name: 'sad but relieved face', category: 'smileys' },
  // People (25) - skin tone support
  { emoji: '\u{1F44D}', name: 'thumbs up like', category: 'people', skinToneBase: true },
  { emoji: '\u{1F44E}', name: 'thumbs down dislike', category: 'people', skinToneBase: true },
  { emoji: '\u{1F44F}', name: 'clapping hands applause', category: 'people', skinToneBase: true },
  { emoji: '\u{1F64F}', name: 'folded hands pray please', category: 'people', skinToneBase: true },
  { emoji: '\u{1F44B}', name: 'waving hand hello bye', category: 'people', skinToneBase: true },
  { emoji: '\u{1F44C}', name: 'ok hand perfect', category: 'people', skinToneBase: true },
  { emoji: '\u{270C}\u{FE0F}', name: 'victory hand peace sign', category: 'people', skinToneBase: true },
  { emoji: '\u{1F91E}', name: 'crossed fingers luck hope', category: 'people', skinToneBase: true },
  { emoji: '\u{1F919}', name: 'call me hand shaka', category: 'people', skinToneBase: true },
  { emoji: '\u{1F4AA}', name: 'flexed biceps strong muscle', category: 'people', skinToneBase: true },
  { emoji: '\u{1F91D}', name: 'handshake deal agreement', category: 'people' },
  { emoji: '\u{270D}\u{FE0F}', name: 'writing hand', category: 'people', skinToneBase: true },
  { emoji: '\u{1F64B}', name: 'person raising hand', category: 'people', skinToneBase: true },
  { emoji: '\u{1F647}', name: 'person bowing', category: 'people', skinToneBase: true },
  { emoji: '\u{1F926}', name: 'person facepalming', category: 'people', skinToneBase: true },
  { emoji: '\u{1F937}', name: 'person shrugging', category: 'people', skinToneBase: true },
  { emoji: '\u{1F46A}', name: 'family', category: 'people' },
  { emoji: '\u{1F46B}', name: 'couple man woman holding hands', category: 'people' },
  { emoji: '\u{1F468}', name: 'man', category: 'people', skinToneBase: true },
  { emoji: '\u{1F469}', name: 'woman', category: 'people', skinToneBase: true },
  { emoji: '\u{1F476}', name: 'baby child', category: 'people', skinToneBase: true },
  { emoji: '\u{1F474}', name: 'old man elderly', category: 'people', skinToneBase: true },
  { emoji: '\u{1F475}', name: 'old woman elderly', category: 'people', skinToneBase: true },
  { emoji: '\u{1F46E}', name: 'police officer', category: 'people', skinToneBase: true },
  { emoji: '\u{1F477}', name: 'construction worker', category: 'people', skinToneBase: true },
  // Animals (25)
  { emoji: '\u{1F436}', name: 'dog face puppy', category: 'animals' },
  { emoji: '\u{1F431}', name: 'cat face kitten', category: 'animals' },
  { emoji: '\u{1F42D}', name: 'mouse face', category: 'animals' },
  { emoji: '\u{1F439}', name: 'hamster face', category: 'animals' },
  { emoji: '\u{1F430}', name: 'rabbit face bunny', category: 'animals' },
  { emoji: '\u{1F98A}', name: 'fox face', category: 'animals' },
  { emoji: '\u{1F43B}', name: 'bear face', category: 'animals' },
  { emoji: '\u{1F43C}', name: 'panda face', category: 'animals' },
  { emoji: '\u{1F428}', name: 'koala', category: 'animals' },
  { emoji: '\u{1F42F}', name: 'tiger face', category: 'animals' },
  { emoji: '\u{1F981}', name: 'lion face', category: 'animals' },
  { emoji: '\u{1F42E}', name: 'cow face', category: 'animals' },
  { emoji: '\u{1F437}', name: 'pig face', category: 'animals' },
  { emoji: '\u{1F438}', name: 'frog face', category: 'animals' },
  { emoji: '\u{1F435}', name: 'monkey face', category: 'animals' },
  { emoji: '\u{1F414}', name: 'chicken hen', category: 'animals' },
  { emoji: '\u{1F427}', name: 'penguin', category: 'animals' },
  { emoji: '\u{1F426}', name: 'bird', category: 'animals' },
  { emoji: '\u{1F985}', name: 'eagle', category: 'animals' },
  { emoji: '\u{1F989}', name: 'owl', category: 'animals' },
  { emoji: '\u{1F40A}', name: 'crocodile alligator', category: 'animals' },
  { emoji: '\u{1F422}', name: 'turtle tortoise', category: 'animals' },
  { emoji: '\u{1F40D}', name: 'snake', category: 'animals' },
  { emoji: '\u{1F433}', name: 'whale spouting', category: 'animals' },
  { emoji: '\u{1F42C}', name: 'dolphin', category: 'animals' },
  { emoji: '\u{1F41D}', name: 'bee honeybee', category: 'animals' },
  { emoji: '\u{1F98B}', name: 'butterfly', category: 'animals' },
  // Food (25)
  { emoji: '\u{1F34E}', name: 'red apple fruit', category: 'food' },
  { emoji: '\u{1F34A}', name: 'tangerine orange', category: 'food' },
  { emoji: '\u{1F34B}', name: 'lemon citrus', category: 'food' },
  { emoji: '\u{1F34C}', name: 'banana fruit', category: 'food' },
  { emoji: '\u{1F349}', name: 'watermelon fruit', category: 'food' },
  { emoji: '\u{1F347}', name: 'grapes fruit', category: 'food' },
  { emoji: '\u{1F353}', name: 'strawberry fruit', category: 'food' },
  { emoji: '\u{1F351}', name: 'peach fruit', category: 'food' },
  { emoji: '\u{1F352}', name: 'cherries fruit', category: 'food' },
  { emoji: '\u{1F355}', name: 'pizza slice', category: 'food' },
  { emoji: '\u{1F354}', name: 'hamburger burger', category: 'food' },
  { emoji: '\u{1F35F}', name: 'french fries chips', category: 'food' },
  { emoji: '\u{1F32D}', name: 'hot dog frankfurter', category: 'food' },
  { emoji: '\u{1F32E}', name: 'taco mexican', category: 'food' },
  { emoji: '\u{1F32F}', name: 'burrito wrap', category: 'food' },
  { emoji: '\u{1F363}', name: 'sushi japanese', category: 'food' },
  { emoji: '\u{1F35C}', name: 'steaming bowl noodles ramen', category: 'food' },
  { emoji: '\u{1F370}', name: 'shortcake cake dessert', category: 'food' },
  { emoji: '\u{1F36B}', name: 'chocolate bar candy', category: 'food' },
  { emoji: '\u{1F369}', name: 'doughnut donut', category: 'food' },
  { emoji: '\u{1F36A}', name: 'cookie biscuit', category: 'food' },
  { emoji: '\u{2615}', name: 'hot beverage coffee tea', category: 'food' },
  { emoji: '\u{1F37A}', name: 'beer mug', category: 'food' },
  { emoji: '\u{1F377}', name: 'wine glass', category: 'food' },
  { emoji: '\u{1F375}', name: 'teacup green tea', category: 'food' },
  // Travel (25)
  { emoji: '\u{1F697}', name: 'automobile car', category: 'travel' },
  { emoji: '\u{1F695}', name: 'taxi cab', category: 'travel' },
  { emoji: '\u{1F68C}', name: 'bus public transport', category: 'travel' },
  { emoji: '\u{1F693}', name: 'police car', category: 'travel' },
  { emoji: '\u{1F691}', name: 'ambulance emergency', category: 'travel' },
  { emoji: '\u{1F692}', name: 'fire engine truck', category: 'travel' },
  { emoji: '\u{1F680}', name: 'rocket launch space', category: 'travel' },
  { emoji: '\u{2708}\u{FE0F}', name: 'airplane plane flight', category: 'travel' },
  { emoji: '\u{1F6F3}\u{FE0F}', name: 'passenger ship cruise', category: 'travel' },
  { emoji: '\u{1F682}', name: 'locomotive train', category: 'travel' },
  { emoji: '\u{1F6B2}', name: 'bicycle bike cycling', category: 'travel' },
  { emoji: '\u{1F3E0}', name: 'house home building', category: 'travel' },
  { emoji: '\u{1F3E2}', name: 'office building', category: 'travel' },
  { emoji: '\u{1F3E5}', name: 'hospital', category: 'travel' },
  { emoji: '\u{1F3EB}', name: 'school', category: 'travel' },
  { emoji: '\u{1F3F0}', name: 'castle european', category: 'travel' },
  { emoji: '\u{26EA}', name: 'church', category: 'travel' },
  { emoji: '\u{1F5FC}', name: 'tokyo tower', category: 'travel' },
  { emoji: '\u{1F5FD}', name: 'statue of liberty', category: 'travel' },
  { emoji: '\u{1F30D}', name: 'globe earth europe africa world', category: 'travel' },
  { emoji: '\u{1F30E}', name: 'globe earth americas world', category: 'travel' },
  { emoji: '\u{1F30F}', name: 'globe earth asia world', category: 'travel' },
  { emoji: '\u{1F3D6}\u{FE0F}', name: 'beach umbrella vacation', category: 'travel' },
  { emoji: '\u{26F0}\u{FE0F}', name: 'mountain', category: 'travel' },
  { emoji: '\u{1F3DD}\u{FE0F}', name: 'desert island tropical', category: 'travel' },
  // Activities (20)
  { emoji: '\u{26BD}', name: 'soccer ball football', category: 'activities' },
  { emoji: '\u{1F3C0}', name: 'basketball', category: 'activities' },
  { emoji: '\u{1F3C8}', name: 'american football', category: 'activities' },
  { emoji: '\u{26BE}', name: 'baseball', category: 'activities' },
  { emoji: '\u{1F3BE}', name: 'tennis racquet ball', category: 'activities' },
  { emoji: '\u{1F3D0}', name: 'volleyball', category: 'activities' },
  { emoji: '\u{1F3B1}', name: 'pool billiards 8 ball', category: 'activities' },
  { emoji: '\u{1F3B3}', name: 'bowling', category: 'activities' },
  { emoji: '\u{1F3AE}', name: 'video game controller', category: 'activities' },
  { emoji: '\u{1F3AF}', name: 'direct hit target bullseye', category: 'activities' },
  { emoji: '\u{1F3B2}', name: 'game die dice', category: 'activities' },
  { emoji: '\u{265F}\u{FE0F}', name: 'chess pawn', category: 'activities' },
  { emoji: '\u{1F3B5}', name: 'musical note', category: 'activities' },
  { emoji: '\u{1F3B6}', name: 'musical notes', category: 'activities' },
  { emoji: '\u{1F3A4}', name: 'microphone karaoke singing', category: 'activities' },
  { emoji: '\u{1F3A7}', name: 'headphone music audio', category: 'activities' },
  { emoji: '\u{1F3AC}', name: 'clapper board movie film', category: 'activities' },
  { emoji: '\u{1F3A8}', name: 'artist palette paint art', category: 'activities' },
  { emoji: '\u{1F3AD}', name: 'performing arts theater masks', category: 'activities' },
  { emoji: '\u{1F3C6}', name: 'trophy winner cup award', category: 'activities' },
  // Objects (25)
  { emoji: '\u{1F4F1}', name: 'mobile phone smartphone', category: 'objects' },
  { emoji: '\u{1F4BB}', name: 'laptop computer pc', category: 'objects' },
  { emoji: '\u{1F5A5}\u{FE0F}', name: 'desktop computer monitor', category: 'objects' },
  { emoji: '\u{2328}\u{FE0F}', name: 'keyboard typing', category: 'objects' },
  { emoji: '\u{1F4F7}', name: 'camera photo', category: 'objects' },
  { emoji: '\u{1F4FA}', name: 'television tv screen', category: 'objects' },
  { emoji: '\u{1F4A1}', name: 'light bulb idea', category: 'objects' },
  { emoji: '\u{1F50B}', name: 'battery power', category: 'objects' },
  { emoji: '\u{1F50C}', name: 'electric plug power', category: 'objects' },
  { emoji: '\u{1F4E7}', name: 'email envelope mail', category: 'objects' },
  { emoji: '\u{1F4DD}', name: 'memo note writing', category: 'objects' },
  { emoji: '\u{1F4DA}', name: 'books stack reading', category: 'objects' },
  { emoji: '\u{1F4D6}', name: 'open book reading', category: 'objects' },
  { emoji: '\u{1F4B0}', name: 'money bag cash', category: 'objects' },
  { emoji: '\u{1F4B3}', name: 'credit card payment', category: 'objects' },
  { emoji: '\u{1F4B5}', name: 'dollar banknote money', category: 'objects' },
  { emoji: '\u{1F511}', name: 'key lock security', category: 'objects' },
  { emoji: '\u{1F512}', name: 'locked padlock security', category: 'objects' },
  { emoji: '\u{1F513}', name: 'unlocked padlock open', category: 'objects' },
  { emoji: '\u{1F50D}', name: 'magnifying glass search left', category: 'objects' },
  { emoji: '\u{1F4CC}', name: 'pushpin pin tack', category: 'objects' },
  { emoji: '\u{1F4CE}', name: 'paperclip attachment', category: 'objects' },
  { emoji: '\u{1F4CB}', name: 'clipboard list', category: 'objects' },
  { emoji: '\u{1F4C5}', name: 'calendar date', category: 'objects' },
  { emoji: '\u{1F4C8}', name: 'chart increasing graph up', category: 'objects' },
  // Symbols (25)
  { emoji: '\u{2764}\u{FE0F}', name: 'red heart love', category: 'symbols' },
  { emoji: '\u{1F9E1}', name: 'orange heart', category: 'symbols' },
  { emoji: '\u{1F49B}', name: 'yellow heart', category: 'symbols' },
  { emoji: '\u{1F49A}', name: 'green heart', category: 'symbols' },
  { emoji: '\u{1F499}', name: 'blue heart', category: 'symbols' },
  { emoji: '\u{1F49C}', name: 'purple heart', category: 'symbols' },
  { emoji: '\u{1F5A4}', name: 'black heart', category: 'symbols' },
  { emoji: '\u{1F494}', name: 'broken heart', category: 'symbols' },
  { emoji: '\u{2705}', name: 'check mark button done yes', category: 'symbols' },
  { emoji: '\u{274C}', name: 'cross mark no cancel', category: 'symbols' },
  { emoji: '\u{2757}', name: 'exclamation mark red', category: 'symbols' },
  { emoji: '\u{2753}', name: 'question mark red', category: 'symbols' },
  { emoji: '\u{1F4AF}', name: 'hundred points perfect score', category: 'symbols' },
  { emoji: '\u{1F525}', name: 'fire flame hot lit', category: 'symbols' },
  { emoji: '\u{2728}', name: 'sparkles stars magic', category: 'symbols' },
  { emoji: '\u{1F31F}', name: 'glowing star', category: 'symbols' },
  { emoji: '\u{26A0}\u{FE0F}', name: 'warning sign caution alert', category: 'symbols' },
  { emoji: '\u{1F6AB}', name: 'prohibited forbidden no', category: 'symbols' },
  { emoji: '\u{267B}\u{FE0F}', name: 'recycling symbol green', category: 'symbols' },
  { emoji: '\u{1F4A4}', name: 'zzz sleeping', category: 'symbols' },
  { emoji: '\u{1F4A2}', name: 'anger symbol', category: 'symbols' },
  { emoji: '\u{1F4AC}', name: 'speech balloon talk', category: 'symbols' },
  { emoji: '\u{1F4AD}', name: 'thought balloon think', category: 'symbols' },
  { emoji: '\u{1F508}', name: 'speaker low volume sound', category: 'symbols' },
  { emoji: '\u{1F514}', name: 'bell notification alert', category: 'symbols' },
  // Flags (20)
  { emoji: '\u{1F1FA}\u{1F1F8}', name: 'flag united states usa', category: 'flags' },
  { emoji: '\u{1F1EC}\u{1F1E7}', name: 'flag united kingdom uk', category: 'flags' },
  { emoji: '\u{1F1EB}\u{1F1F7}', name: 'flag france french', category: 'flags' },
  { emoji: '\u{1F1E9}\u{1F1EA}', name: 'flag germany german', category: 'flags' },
  { emoji: '\u{1F1EE}\u{1F1F9}', name: 'flag italy italian', category: 'flags' },
  { emoji: '\u{1F1EA}\u{1F1F8}', name: 'flag spain spanish', category: 'flags' },
  { emoji: '\u{1F1F5}\u{1F1F9}', name: 'flag portugal portuguese', category: 'flags' },
  { emoji: '\u{1F1E7}\u{1F1F7}', name: 'flag brazil brazilian', category: 'flags' },
  { emoji: '\u{1F1E8}\u{1F1E6}', name: 'flag canada canadian', category: 'flags' },
  { emoji: '\u{1F1E6}\u{1F1FA}', name: 'flag australia australian', category: 'flags' },
  { emoji: '\u{1F1EF}\u{1F1F5}', name: 'flag japan japanese', category: 'flags' },
  { emoji: '\u{1F1F0}\u{1F1F7}', name: 'flag south korea korean', category: 'flags' },
  { emoji: '\u{1F1E8}\u{1F1F3}', name: 'flag china chinese', category: 'flags' },
  { emoji: '\u{1F1EE}\u{1F1F3}', name: 'flag india indian', category: 'flags' },
  { emoji: '\u{1F1F2}\u{1F1FD}', name: 'flag mexico mexican', category: 'flags' },
  { emoji: '\u{1F1F7}\u{1F1FA}', name: 'flag russia russian', category: 'flags' },
  { emoji: '\u{1F1F8}\u{1F1E6}', name: 'flag saudi arabia', category: 'flags' },
  { emoji: '\u{1F1F9}\u{1F1F7}', name: 'flag turkey turkish', category: 'flags' },
  { emoji: '\u{1F1E6}\u{1F1F7}', name: 'flag argentina', category: 'flags' },
  { emoji: '\u{1F3F4}', name: 'black flag waving', category: 'flags' },
];

const CATEGORY_IDS = ['smileys', 'people', 'animals', 'food', 'travel', 'activities', 'objects', 'symbols', 'flags'] as const;

const CATEGORY_LABELS: Record<string, Record<Locale, string>> = {
  smileys: { en: 'Smileys', it: 'Faccine', es: 'Caritas', fr: 'Smileys', de: 'Smileys', pt: 'Carinhas' },
  people: { en: 'People', it: 'Persone', es: 'Personas', fr: 'Personnes', de: 'Personen', pt: 'Pessoas' },
  animals: { en: 'Animals', it: 'Animali', es: 'Animales', fr: 'Animaux', de: 'Tiere', pt: 'Animais' },
  food: { en: 'Food', it: 'Cibo', es: 'Comida', fr: 'Nourriture', de: 'Essen', pt: 'Comida' },
  travel: { en: 'Travel', it: 'Viaggi', es: 'Viajes', fr: 'Voyages', de: 'Reisen', pt: 'Viagens' },
  activities: { en: 'Activities', it: 'Attivit\u00E0', es: 'Actividades', fr: 'Activit\u00E9s', de: 'Aktivit\u00E4ten', pt: 'Atividades' },
  objects: { en: 'Objects', it: 'Oggetti', es: 'Objetos', fr: 'Objets', de: 'Objekte', pt: 'Objetos' },
  symbols: { en: 'Symbols', it: 'Simboli', es: 'S\u00EDmbolos', fr: 'Symboles', de: 'Symbole', pt: 'S\u00EDmbolos' },
  flags: { en: 'Flags', it: 'Bandiere', es: 'Banderas', fr: 'Drapeaux', de: 'Flaggen', pt: 'Bandeiras' },
};

const LS_KEY = 'emoji-picker-recent';

export default function EmojiPicker() {
  const { lang } = useParams() as { lang: Locale };
  const toolT = tools['emoji-picker'][lang];

  const [selectedCategory, setSelectedCategory] = useState<string>('smileys');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiEntry | null>(null);
  const [skinTone, setSkinTone] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Load recently used from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) setRecentlyUsed(JSON.parse(stored));
    } catch {}
  }, []);

  const labels: Record<string, Record<Locale, string>> = {
    search: { en: 'Search emojis...', it: 'Cerca emoji...', es: 'Buscar emojis...', fr: 'Rechercher des emojis...', de: 'Emojis suchen...', pt: 'Buscar emojis...' },
    clickToCopy: { en: 'Click any emoji to copy', it: 'Clicca un emoji per copiarlo', es: 'Haz clic en un emoji para copiarlo', fr: 'Cliquez sur un emoji pour le copier', de: 'Klicken Sie auf ein Emoji zum Kopieren', pt: 'Clique em um emoji para copiar' },
    copied: { en: 'Copied!', it: 'Copiato!', es: '\u00A1Copiado!', fr: 'Copi\u00E9 !', de: 'Kopiert!', pt: 'Copiado!' },
    recentlyUsed: { en: 'Recently Used', it: 'Usati di Recente', es: 'Usados Recientemente', fr: 'Utilis\u00E9s R\u00E9cemment', de: 'K\u00FCrzlich Verwendet', pt: 'Usados Recentemente' },
    emojiInfo: { en: 'Emoji Info', it: 'Info Emoji', es: 'Info Emoji', fr: 'Info Emoji', de: 'Emoji-Info', pt: 'Info Emoji' },
    name: { en: 'Name', it: 'Nome', es: 'Nombre', fr: 'Nom', de: 'Name', pt: 'Nome' },
    unicode: { en: 'Unicode', it: 'Unicode', es: 'Unicode', fr: 'Unicode', de: 'Unicode', pt: 'Unicode' },
    htmlEntity: { en: 'HTML Entity', it: 'Entit\u00E0 HTML', es: 'Entidad HTML', fr: 'Entit\u00E9 HTML', de: 'HTML-Entit\u00E4t', pt: 'Entidade HTML' },
    copyEmoji: { en: 'Copy Emoji', it: 'Copia Emoji', es: 'Copiar Emoji', fr: 'Copier Emoji', de: 'Emoji Kopieren', pt: 'Copiar Emoji' },
    copyCode: { en: 'Copy Code', it: 'Copia Codice', es: 'Copiar C\u00F3digo', fr: 'Copier Code', de: 'Code Kopieren', pt: 'Copiar C\u00F3digo' },
    skinTone: { en: 'Skin Tone', it: 'Tonalità Pelle', es: 'Tono de Piel', fr: 'Teint de Peau', de: 'Hautfarbe', pt: 'Tom de Pele' },
    all: { en: 'All', it: 'Tutti', es: 'Todos', fr: 'Tous', de: 'Alle', pt: 'Todos' },
    noResults: { en: 'No emojis found', it: 'Nessun emoji trovato', es: 'No se encontraron emojis', fr: 'Aucun emoji trouv\u00E9', de: 'Keine Emojis gefunden', pt: 'Nenhum emoji encontrado' },
  };

  const applyEmojiSkinTone = useCallback((entry: EmojiEntry): string => {
    if (entry.skinToneBase && skinTone > 0) {
      return entry.emoji + SKIN_TONES[skinTone].modifier;
    }
    return entry.emoji;
  }, [skinTone]);

  const filteredEmojis = useMemo(() => {
    let base = EMOJI_DATA;
    if (selectedCategory !== 'all' && !search.trim()) {
      base = EMOJI_DATA.filter(e => e.category === selectedCategory);
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      return EMOJI_DATA.filter(e => e.name.toLowerCase().includes(s) || e.category.toLowerCase().includes(s));
    }
    return base;
  }, [search, selectedCategory]);

  const copyToClipboard = useCallback((emoji: string, entry?: EmojiEntry) => {
    navigator.clipboard.writeText(emoji);
    setCopied(emoji);
    if (entry) setSelectedEmoji(entry);
    setRecentlyUsed(prev => {
      const updated = [emoji, ...prev.filter(c => c !== emoji)].slice(0, 16);
      try { localStorage.setItem(LS_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const getEmojiInfo = (emoji: string) => {
    const codePoints = [...emoji].map(c => {
      const cp = c.codePointAt(0) || 0;
      return { hex: cp.toString(16).toUpperCase().padStart(4, '0'), dec: cp };
    });
    return {
      unicode: codePoints.map(cp => `U+${cp.hex}`).join(' '),
      html: codePoints.map(cp => `&#${cp.dec};`).join(''),
    };
  };

  const seoContent: Record<Locale, { title: string; paragraphs: string[]; faq: { q: string; a: string }[] }> = {
    en: {
      title: 'Free Emoji Picker & Search -- Find, Copy & Use Emojis Instantly',
      paragraphs: [
        'Emojis have become an essential part of digital communication. Whether you are writing an email, crafting a social media post, designing a website, or sending a chat message, emojis add emotion, personality, and clarity to your text. Our free Emoji Picker & Search tool makes it effortless to find the perfect emoji from over 200 commonly used characters.',
        'The tool organizes emojis into intuitive categories: Smileys, People, Animals, Food, Travel, Activities, Objects, Symbols, and Flags. Each category is accessible through convenient tabs, allowing you to browse through curated collections without scrolling endlessly. The powerful search bar lets you filter emojis by name or keyword, so you can type "heart" or "fire" and instantly see matching results.',
        'When you click an emoji, it is copied to your clipboard instantly with a confirmation toast, ready to paste anywhere. The emoji info panel displays the character name, Unicode code point, and HTML entity, which is invaluable for web developers and content creators. The skin tone selector lets you customize people emojis with six different skin tones, adding inclusivity to your messaging.',
        'The recently used section saves your frequently copied emojis to localStorage, giving you quick access to your favorites across sessions. Whether you are a social media manager, a developer integrating emojis into code, or simply someone who loves using emojis every day, this tool streamlines the process. No more hunting through tiny keyboard emoji panels -- everything is displayed in a large, easy-to-browse grid.',
      ],
      faq: [
        { q: 'How do I copy an emoji?', a: 'Simply click on any emoji in the grid to copy it to your clipboard. A toast notification will confirm the copy. Then paste it (Ctrl+V or Cmd+V) into any application, document, website, or social media post.' },
        { q: 'What is a Unicode code point?', a: 'A Unicode code point is a unique hexadecimal number assigned to every character and emoji in the Unicode standard. For example, the red heart emoji has the code point U+2764. This ensures emojis display consistently across devices and platforms.' },
        { q: 'Can I change skin tone for people emojis?', a: 'Yes! Use the skin tone selector to choose from six options: default yellow, light, medium-light, medium, medium-dark, and dark. The selected skin tone is applied to all people and gesture emojis that support skin tone modifiers.' },
        { q: 'Are my recently used emojis saved?', a: 'Yes, your recently used emojis are saved in your browser localStorage. They persist across sessions on the same browser and device. No data is sent to any server -- everything stays on your device.' },
        { q: 'How do I use emojis in HTML or code?', a: 'Click an emoji to see its HTML entity (e.g., &#128512;) in the info panel. You can copy this code and use it directly in HTML files. For CSS, you can use the Unicode escape format. The tool shows all the technical details you need.' },
      ],
    },
    it: {
      title: 'Emoji Picker e Ricerca Gratuito -- Trova, Copia e Usa gli Emoji Istantaneamente',
      paragraphs: [
        'Gli emoji sono diventati parte essenziale della comunicazione digitale. Che tu stia scrivendo un\'email, creando un post sui social, progettando un sito web o inviando un messaggio in chat, gli emoji aggiungono emozione, personalit\u00E0 e chiarezza al tuo testo. Il nostro strumento gratuito Emoji Picker & Ricerca rende semplice trovare l\'emoji perfetto tra oltre 200 caratteri comunemente usati.',
        'Lo strumento organizza gli emoji in categorie intuitive: Faccine, Persone, Animali, Cibo, Viaggi, Attivit\u00E0, Oggetti, Simboli e Bandiere. La barra di ricerca permette di filtrare gli emoji per nome o parola chiave. Quando clicchi un emoji, viene copiato negli appunti con una notifica di conferma.',
        'Il pannello informativo mostra il nome del carattere, il code point Unicode e l\'entit\u00E0 HTML, preziosi per sviluppatori web e creatori di contenuti. Il selettore di tono della pelle permette di personalizzare gli emoji delle persone con sei diverse tonalit\u00E0.',
        'La sezione "Usati di recente" salva i tuoi emoji copiati frequentemente nel localStorage del browser, dandoti accesso rapido ai tuoi preferiti tra le sessioni. Nessun dato viene inviato a server -- tutto resta sul tuo dispositivo.',
      ],
      faq: [
        { q: 'Come copio un emoji?', a: 'Clicca su qualsiasi emoji nella griglia per copiarlo negli appunti. Una notifica confermer\u00E0 la copia. Poi incollalo (Ctrl+V) in qualsiasi applicazione.' },
        { q: 'Cos\'\u00E8 un code point Unicode?', a: '\u00C8 un numero esadecimale unico assegnato a ogni carattere ed emoji nello standard Unicode. Garantisce che gli emoji vengano visualizzati uniformemente su tutti i dispositivi.' },
        { q: 'Posso cambiare il tono della pelle?', a: 'S\u00EC! Usa il selettore del tono della pelle per scegliere tra sei opzioni. Il tono selezionato viene applicato a tutti gli emoji di persone e gesti.' },
        { q: 'I miei emoji recenti vengono salvati?', a: 'S\u00EC, vengono salvati nel localStorage del browser e persistono tra le sessioni. Nessun dato viene inviato a server.' },
        { q: 'Come uso gli emoji in HTML?', a: 'Clicca un emoji per vedere la sua entit\u00E0 HTML nel pannello informativo. Puoi copiare questo codice e usarlo direttamente nei file HTML.' },
      ],
    },
    es: {
      title: 'Selector de Emojis Gratis -- Encuentra, Copia y Usa Emojis al Instante',
      paragraphs: [
        'Los emojis se han convertido en una parte esencial de la comunicaci\u00F3n digital. Ya sea que est\u00E9s escribiendo un correo, creando una publicaci\u00F3n en redes sociales o enviando un mensaje, los emojis a\u00F1aden emoci\u00F3n y personalidad a tu texto. Nuestro selector de emojis gratuito facilita encontrar el emoji perfecto entre m\u00E1s de 200 caracteres.',
        'La herramienta organiza los emojis en categor\u00EDas intuitivas: Caritas, Personas, Animales, Comida, Viajes, Actividades, Objetos, S\u00EDmbolos y Banderas. La barra de b\u00FAsqueda permite filtrar emojis por nombre o palabra clave.',
        'Al hacer clic en un emoji, se copia al portapapeles con una notificaci\u00F3n. El panel de informaci\u00F3n muestra el nombre, code point Unicode y entidad HTML. El selector de tono de piel permite personalizar los emojis de personas.',
        'La secci\u00F3n de usados recientemente guarda tus emojis favoritos en el localStorage del navegador para acceso r\u00E1pido entre sesiones.',
      ],
      faq: [
        { q: '\u00BFC\u00F3mo copio un emoji?', a: 'Haz clic en cualquier emoji de la cuadr\u00EDcula para copiarlo. Una notificaci\u00F3n confirmar\u00E1 la copia. Luego p\u00E9galo (Ctrl+V) en cualquier aplicaci\u00F3n.' },
        { q: '\u00BFQu\u00E9 es un code point Unicode?', a: 'Es un n\u00FAmero hexadecimal \u00FAnico asignado a cada car\u00E1cter y emoji en el est\u00E1ndar Unicode. Garantiza que los emojis se muestren correctamente en todos los dispositivos.' },
        { q: '\u00BFPuedo cambiar el tono de piel?', a: '\u00A1S\u00ED! Usa el selector de tono de piel para elegir entre seis opciones que se aplican a los emojis de personas.' },
        { q: '\u00BFSe guardan mis emojis recientes?', a: 'S\u00ED, se guardan en el localStorage del navegador y persisten entre sesiones. Ning\u00FAn dato se env\u00EDa a servidores.' },
        { q: '\u00BFC\u00F3mo uso emojis en HTML?', a: 'Haz clic en un emoji para ver su entidad HTML en el panel informativo. Puedes copiar ese c\u00F3digo y usarlo directamente en archivos HTML.' },
      ],
    },
    fr: {
      title: 'S\u00E9lecteur d\'Emojis Gratuit -- Trouvez, Copiez et Utilisez des Emojis Instantan\u00E9ment',
      paragraphs: [
        'Les emojis sont devenus une partie essentielle de la communication num\u00E9rique. Que vous \u00E9criviez un email, cr\u00E9iez un post sur les r\u00E9seaux sociaux ou envoyiez un message, les emojis ajoutent \u00E9motion et personnalit\u00E9 \u00E0 votre texte. Notre s\u00E9lecteur d\'emojis gratuit facilite la recherche parmi plus de 200 caract\u00E8res.',
        'L\'outil organise les emojis en cat\u00E9gories intuitives : Smileys, Personnes, Animaux, Nourriture, Voyages, Activit\u00E9s, Objets, Symboles et Drapeaux. La barre de recherche permet de filtrer par nom ou mot-cl\u00E9.',
        'En cliquant sur un emoji, il est copi\u00E9 dans le presse-papiers avec une notification. Le panneau d\'information affiche le nom, le code point Unicode et l\'entit\u00E9 HTML. Le s\u00E9lecteur de teint permet de personnaliser les emojis de personnes.',
        'La section des emojis r\u00E9cemment utilis\u00E9s sauvegarde vos favoris dans le localStorage du navigateur pour un acc\u00E8s rapide entre les sessions.',
      ],
      faq: [
        { q: 'Comment copier un emoji ?', a: 'Cliquez sur n\'importe quel emoji dans la grille pour le copier. Une notification confirmera la copie. Collez-le ensuite (Ctrl+V) dans n\'importe quelle application.' },
        { q: 'Qu\'est-ce qu\'un code point Unicode ?', a: 'C\'est un num\u00E9ro hexad\u00E9cimal unique attribu\u00E9 \u00E0 chaque caract\u00E8re et emoji dans le standard Unicode. Il garantit un affichage coh\u00E9rent sur tous les appareils.' },
        { q: 'Puis-je changer le teint de peau ?', a: 'Oui ! Utilisez le s\u00E9lecteur de teint pour choisir parmi six options appliqu\u00E9es aux emojis de personnes.' },
        { q: 'Mes emojis r\u00E9cents sont-ils sauvegard\u00E9s ?', a: 'Oui, ils sont sauvegard\u00E9s dans le localStorage du navigateur et persistent entre les sessions. Aucune donn\u00E9e n\'est envoy\u00E9e \u00E0 un serveur.' },
        { q: 'Comment utiliser les emojis en HTML ?', a: 'Cliquez sur un emoji pour voir son entit\u00E9 HTML dans le panneau d\'information. Copiez ce code pour l\'utiliser directement dans vos fichiers HTML.' },
      ],
    },
    de: {
      title: 'Kostenloser Emoji-Picker & Suche -- Emojis Finden, Kopieren und Sofort Verwenden',
      paragraphs: [
        'Emojis sind ein wesentlicher Bestandteil der digitalen Kommunikation geworden. Ob Sie eine E-Mail schreiben, einen Social-Media-Beitrag erstellen oder eine Nachricht senden -- Emojis f\u00FCgen Emotion und Pers\u00F6nlichkeit hinzu. Unser kostenloser Emoji-Picker erleichtert das Finden des perfekten Emojis unter \u00FCber 200 Zeichen.',
        'Das Tool organisiert Emojis in intuitive Kategorien: Smileys, Personen, Tiere, Essen, Reisen, Aktivit\u00E4ten, Objekte, Symbole und Flaggen. Die Suchleiste erm\u00F6glicht das Filtern nach Name oder Schl\u00FCsselwort.',
        'Beim Klicken auf ein Emoji wird es sofort in die Zwischenablage kopiert mit einer Best\u00E4tigungsbenachrichtigung. Das Info-Panel zeigt den Namen, Unicode-Codepunkt und die HTML-Entit\u00E4t. Der Hautfarben-W\u00E4hler erm\u00F6glicht die Anpassung von Personen-Emojis.',
        'Der Bereich der k\u00FCrzlich verwendeten Emojis speichert Ihre Favoriten im localStorage des Browsers f\u00FCr schnellen Zugriff zwischen Sitzungen.',
      ],
      faq: [
        { q: 'Wie kopiere ich ein Emoji?', a: 'Klicken Sie auf ein beliebiges Emoji im Raster, um es zu kopieren. Eine Benachrichtigung best\u00E4tigt den Kopiervorgang. F\u00FCgen Sie es dann (Strg+V) in eine beliebige Anwendung ein.' },
        { q: 'Was ist ein Unicode-Codepunkt?', a: 'Ein Unicode-Codepunkt ist eine eindeutige Hexadezimalzahl, die jedem Zeichen und Emoji im Unicode-Standard zugewiesen wird. Er gew\u00E4hrleistet eine einheitliche Darstellung auf allen Ger\u00E4ten.' },
        { q: 'Kann ich den Hautton \u00E4ndern?', a: 'Ja! Verwenden Sie den Hautton-W\u00E4hler, um aus sechs Optionen zu w\u00E4hlen, die auf Personen-Emojis angewendet werden.' },
        { q: 'Werden meine zuletzt verwendeten Emojis gespeichert?', a: 'Ja, sie werden im localStorage des Browsers gespeichert und bleiben zwischen Sitzungen erhalten. Keine Daten werden an Server gesendet.' },
        { q: 'Wie verwende ich Emojis in HTML?', a: 'Klicken Sie auf ein Emoji, um seine HTML-Entit\u00E4t im Info-Panel zu sehen. Kopieren Sie diesen Code, um ihn direkt in HTML-Dateien zu verwenden.' },
      ],
    },
    pt: {
      title: 'Seletor de Emojis Gr\u00E1tis -- Encontre, Copie e Use Emojis Instantaneamente',
      paragraphs: [
        'Os emojis tornaram-se uma parte essencial da comunica\u00E7\u00E3o digital. Seja escrevendo um email, criando uma postagem nas redes sociais ou enviando uma mensagem, os emojis adicionam emo\u00E7\u00E3o e personalidade ao seu texto. Nosso seletor de emojis gratuito facilita encontrar o emoji perfeito entre mais de 200 caracteres.',
        'A ferramenta organiza os emojis em categorias intuitivas: Carinhas, Pessoas, Animais, Comida, Viagens, Atividades, Objetos, S\u00EDmbolos e Bandeiras. A barra de busca permite filtrar emojis por nome ou palavra-chave.',
        'Ao clicar em um emoji, ele \u00E9 copiado para a \u00E1rea de transfer\u00EAncia com uma notifica\u00E7\u00E3o. O painel de informa\u00E7\u00F5es mostra o nome, code point Unicode e entidade HTML. O seletor de tom de pele permite personalizar os emojis de pessoas.',
        'A se\u00E7\u00E3o de usados recentemente salva seus emojis favoritos no localStorage do navegador para acesso r\u00E1pido entre sess\u00F5es.',
      ],
      faq: [
        { q: 'Como copio um emoji?', a: 'Clique em qualquer emoji na grade para copi\u00E1-lo. Uma notifica\u00E7\u00E3o confirmar\u00E1 a c\u00F3pia. Cole-o (Ctrl+V) em qualquer aplicativo.' },
        { q: 'O que \u00E9 um code point Unicode?', a: '\u00C9 um n\u00FAmero hexadecimal \u00FAnico atribu\u00EDdo a cada caractere e emoji no padr\u00E3o Unicode. Garante que os emojis sejam exibidos corretamente em todos os dispositivos.' },
        { q: 'Posso mudar o tom de pele?', a: 'Sim! Use o seletor de tom de pele para escolher entre seis op\u00E7\u00F5es aplicadas aos emojis de pessoas.' },
        { q: 'Meus emojis recentes s\u00E3o salvos?', a: 'Sim, s\u00E3o salvos no localStorage do navegador e persistem entre sess\u00F5es. Nenhum dado \u00E9 enviado a servidores.' },
        { q: 'Como uso emojis em HTML?', a: 'Clique em um emoji para ver sua entidade HTML no painel de informa\u00E7\u00F5es. Copie esse c\u00F3digo para us\u00E1-lo diretamente em arquivos HTML.' },
      ],
    },
  };

  const seo = seoContent[lang];

  return (
    <ToolPageWrapper toolSlug="emoji-picker" faqItems={seo.faq}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolT.name}</h1>
        <p className="text-gray-600 mb-6">{toolT.description}</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={labels.search[lang]}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setSelectedCategory('all'); setSearch(''); }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${selectedCategory === 'all' && !search ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {labels.all[lang]}
            </button>
            {CATEGORY_IDS.map((catId) => (
              <button
                key={catId}
                onClick={() => { setSelectedCategory(catId); setSearch(''); }}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${selectedCategory === catId && !search ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {CATEGORY_LABELS[catId][lang]}
              </button>
            ))}
          </div>

          {/* Skin tone selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">{labels.skinTone[lang]}:</span>
            <div className="flex gap-1">
              {SKIN_TONES.map((tone, i) => (
                <button
                  key={i}
                  onClick={() => setSkinTone(i)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm transition-all ${skinTone === i ? 'border-blue-500 scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                  title={tone.label}
                >
                  {i === 0 ? '\u{1F44B}' : `\u{1F44B}${tone.modifier}`}
                </button>
              ))}
            </div>
          </div>

          {/* Recently used */}
          {recentlyUsed.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">{labels.recentlyUsed[lang]}</div>
              <div className="flex flex-wrap gap-1">
                {recentlyUsed.map((emoji, i) => {
                  const entry = EMOJI_DATA.find(e => e.emoji === emoji);
                  return (
                    <button
                      key={i}
                      onClick={() => copyToClipboard(emoji, entry || undefined)}
                      className={`w-9 h-9 flex items-center justify-center text-xl border rounded transition-colors ${copied === emoji ? 'bg-green-100 border-green-400' : 'border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400'}`}
                      title={entry?.name || emoji}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Emoji grid */}
          <div className="text-xs text-gray-400 mb-1">{labels.clickToCopy[lang]}</div>
          {filteredEmojis.length === 0 ? (
            <div className="text-center text-sm text-gray-400 py-8">{labels.noResults[lang]}</div>
          ) : (
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 max-h-72 overflow-y-auto">
              {filteredEmojis.map((entry, i) => {
                const displayed = applyEmojiSkinTone(entry);
                return (
                  <button
                    key={i}
                    onClick={() => copyToClipboard(displayed, entry)}
                    className={`w-full aspect-square flex items-center justify-center text-2xl border rounded transition-all hover:bg-blue-50 hover:border-blue-300 hover:scale-110 ${copied === displayed ? 'bg-green-100 border-green-400' : selectedEmoji === entry ? 'bg-blue-50 border-blue-400' : 'border-gray-200'}`}
                    title={entry.name}
                  >
                    {displayed}
                  </button>
                );
              })}
            </div>
          )}

          {copied && (
            <div className="text-center text-sm text-green-600 font-medium animate-pulse">{labels.copied[lang]}</div>
          )}

          {/* Emoji info panel */}
          {selectedEmoji && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">{labels.emojiInfo[lang]}</div>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-6xl">{applyEmojiSkinTone(selectedEmoji)}</span>
                <div className="space-y-1 text-sm">
                  <div className="text-gray-600 font-medium capitalize">{selectedEmoji.name}</div>
                  <div><span className="text-gray-500">{labels.unicode[lang]}:</span> <code className="bg-white px-2 py-0.5 rounded text-gray-800">{getEmojiInfo(applyEmojiSkinTone(selectedEmoji)).unicode}</code></div>
                  <div><span className="text-gray-500">{labels.htmlEntity[lang]}:</span> <code className="bg-white px-2 py-0.5 rounded text-gray-800">{getEmojiInfo(applyEmojiSkinTone(selectedEmoji)).html}</code></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copyToClipboard(applyEmojiSkinTone(selectedEmoji), selectedEmoji)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors">
                  {labels.copyEmoji[lang]}
                </button>
                <button onClick={() => { navigator.clipboard.writeText(getEmojiInfo(applyEmojiSkinTone(selectedEmoji)).html); setCopied(applyEmojiSkinTone(selectedEmoji)); setTimeout(() => setCopied(null), 1500); }} className="text-xs bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition-colors">
                  {labels.copyCode[lang]} (HTML)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SEO Article */}
        <article className="mt-12 prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{seo.title}</h2>
          {seo.paragraphs.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>)}
        </article>

        {/* FAQ Accordion */}
        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
          <div className="space-y-2">
            {seo.faq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-4 py-3 font-medium text-gray-900 flex justify-between items-center">
                  {item.q}
                  <span className="text-gray-400">{openFaq === i ? '\u2212' : '+'}</span>
                </button>
                {openFaq === i && <div className="px-4 pb-3 text-gray-600">{item.a}</div>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </ToolPageWrapper>
  );
}
