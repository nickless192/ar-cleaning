// import { useTranslation } from 'react-i18next';

// export default function LanguageSwitcher() {
//   const { i18n } = useTranslation();

//   return (
//     <div className="language-switcher d-flex gap-2">
//       <button onClick={() => i18n.changeLanguage('en')}>EN</button>
//       <button onClick={() => i18n.changeLanguage('fr')}>FR</button>
//       <button onClick={() => i18n.changeLanguage('es')}>ES</button>
//     </div>
//   );
// }

// import { useTranslation } from 'react-i18next';
// import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
// import ToggleButton from 'react-bootstrap/ToggleButton';

// export default function LanguageSwitcher() {
//   const { i18n } = useTranslation();

//   const languages = [
//     { code: 'en', label: 'English', short: 'EN' },
//     { code: 'fr', label: 'Français', short: 'FR' },
//     { code: 'es', label: 'Español', short: 'ES' },
//   ];

//   const handleChangeLanguage = (val) => {
//     i18n.changeLanguage(val);
//   };

//   return (
//     <ToggleButtonGroup
//       type="radio"
//       name="language"
//       value={i18n.language}
//       onChange={handleChangeLanguage}
//       aria-label="Language selector"
//       className="language-switcher d-flex justify-content-center gap-1"
//       size="sm"
//     >
//       {languages.map(({ code, label, short }) => (
//         <ToggleButton
//           key={code}
//           id={`lang-${code}`}
//           value={code}
//           variant={i18n.language === code ? 'primary' : 'outline-secondary'}
//           aria-label={`Switch language to ${label}`}
//           size="sm"
//         >
//           {short}
//         </ToggleButton>
//       ))}
//     </ToggleButtonGroup>
//   );
// }

import { useTranslation } from 'react-i18next';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { toast } from 'react-toastify'; // Make sure you have this installed and configured

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', label: 'English', short: 'EN', enabled: true },
    { code: 'fr', label: 'Français', short: 'FR', enabled: false },
    { code: 'es', label: 'Español', short: 'ES', enabled: false },
  ];

  const handleChangeLanguage = (val) => {
    const selected = languages.find((lang) => lang.code === val);
    if (!selected.enabled) {
      // Show a localized "Coming soon" message
      const messages = {
        en: 'Coming soon!',
        fr: 'Bientôt disponible !',
        es: '¡Próximamente!',
      };
      toast.info(t('coming_soon', { lng: val }) || messages[val] || 'Coming soon!');
      return;
    }

    i18n.changeLanguage(val);
  };

  return (
    <ToggleButtonGroup
      type="radio"
      name="language"
      value={i18n.language}
      onChange={handleChangeLanguage}
      aria-label="Language selector"
      className="language-switcher d-flex justify-content-center gap-1"
      size="sm"
    >
      {languages.map(({ code, label, short, enabled }) => (
        <ToggleButton
          key={code}
          id={`lang-${code}`}
          value={code}
          variant={i18n.language === code ? 'primary' : 'outline-secondary'}
          aria-label={`Switch language to ${label}`}
          size="sm"
          // disabled={!enabled}
          style={!enabled ? { opacity: 0.5, pointerEvents: 'auto', cursor: 'not-allowed' } : {}}
        >
          {short}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
