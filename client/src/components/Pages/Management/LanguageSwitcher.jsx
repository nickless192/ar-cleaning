import { useTranslation } from 'react-i18next';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';


export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [languages, setLanguages] = useState([]);


  const handleChangeLanguage = (val) => {
    const selected = languages.find((lang) => lang.code === val);
    if (!selected.enabled) {
      // Show a localized "Coming soon" message
      const messages = {
        en: 'Coming soon!',
        fr: 'Bientôt disponible !',
        es: '¡Próximamente!',
      };
      toast.info(t('products_and_services.coming_soon', { lng: val }) || messages[val] || 'Coming soon!');
      return;
    }

    i18n.changeLanguage(val);
  };

  useEffect(() => {

      setLanguages([
        { code: 'en', label: 'English', short: 'EN', enabled: true },
        { code: 'fr', label: 'Français', short: 'FR', enabled: true },
        { code: 'es', label: 'Español', short: 'ES', enabled: true },
      ]);
    // }
  }, [])

  return (
    <div className="pr-2 d-flex align-items-center">
    <ToggleButtonGroup
      type="radio"
      name="language"
      value={i18n.language}
      onChange={handleChangeLanguage}
      aria-label="Language selector"
      className="language-switcher cleanar-language-switcher d-flex justify-content-center"
      size="sm"
    >
      {languages.map(({ code, label, short, enabled }) => (
        <ToggleButton
          key={code}
          id={`lang-${code}`}
          value={code}
          variant="light"
          aria-label={`Switch language to ${label}`}
          aria-pressed={i18n.language === code}
          className={`cleanar-language-switcher__btn ${i18n.language === code ? 'is-active' : ''}`}
          size="sm"
          // disabled={!enabled}
          style={!enabled ? { opacity: 0.5, pointerEvents: 'auto', cursor: 'not-allowed' } : {}}
        >
          {short}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
      {/* <NewIconAnimated /> */}
    </div>
  );
}
