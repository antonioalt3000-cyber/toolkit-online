'use client';
import { useParams } from 'next/navigation';

const translations: Record<string, {
  support: string;
  text: string;
  thankYou: string;
}> = {
  en: { support: 'Support this project', text: 'If you find our tools useful, consider buying us a coffee!', thankYou: 'Thank you for your support!' },
  it: { support: 'Supporta questo progetto', text: 'Se trovi utili i nostri strumenti, offrici un caffè!', thankYou: 'Grazie per il tuo supporto!' },
  es: { support: 'Apoya este proyecto', text: 'Si encuentras útiles nuestras herramientas, ¡invítanos un café!', thankYou: '¡Gracias por tu apoyo!' },
  fr: { support: 'Soutenez ce projet', text: 'Si vous trouvez nos outils utiles, offrez-nous un café !', thankYou: 'Merci pour votre soutien !' },
  de: { support: 'Unterstütze dieses Projekt', text: 'Wenn du unsere Tools nützlich findest, spendiere uns einen Kaffee!', thankYou: 'Danke für deine Unterstützung!' },
  pt: { support: 'Apoie este projeto', text: 'Se você acha nossas ferramentas úteis, nos pague um café!', thankYou: 'Obrigado pelo seu apoio!' },
};

export default function SupportButton() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const t = translations[lang] || translations.en;

  return (
    <div className="my-6 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 dark:border-amber-800 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <span className="text-lg">☕</span>
            {t.support}
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{t.text}</p>
        </div>
        <a
          href="https://buymeacoffee.com/toolkitonline"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm whitespace-nowrap"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.305-.061-1.938-.188-.297-.06-.588-.139-.876-.232-.187-.06-.373-.128-.564-.169a.077.077 0 01-.057-.063.077.077 0 01.019-.078c.33-.375 1.092-.585 1.487-.75a9.7 9.7 0 001.67-.917c.197-.142.36-.33.455-.558.095-.228.1-.478.064-.722-.06-.41-.276-.778-.555-1.08-.28-.301-.635-.518-1.015-.656a4.317 4.317 0 00-1.196-.258c-.32-.025-.64-.02-.96.004-.33.024-.655.073-.977.138a8.12 8.12 0 00-1.817.578 4.151 4.151 0 00-1.381 1.015c-.337.39-.584.853-.679 1.366-.094.506-.03 1.056.212 1.513.286.539.743.957 1.273 1.235.596.314 1.247.493 1.916.59.777.113 1.577.128 2.357.056.473-.044.94-.122 1.4-.23.444-.104.88-.241 1.284-.449.577-.297 1.084-.74 1.352-1.357.189-.436.244-.906.275-1.38.032-.473.01-.947.048-1.42l.839-8.175c.025-.24.049-.48.075-.72l.046-.39a.318.318 0 01.349-.269c.315.024.617.094.917.17.34.087.67.198 1.012.277.367.086.745.127 1.121.125.437-.002.862-.07 1.27-.22.4-.146.768-.373 1.074-.666.305-.293.54-.65.7-1.043.154-.39.233-.81.235-1.236z"/>
          </svg>
          Buy Me a Coffee
        </a>
      </div>
    </div>
  );
}
