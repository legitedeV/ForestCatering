<?php

if (!defined('_PS_VERSION_')) {
    exit;
}

class Fc_Home extends Module
{
    private const CONFIG_KEYS = [
        'FC_HERO_TITLE',
        'FC_HERO_SUBTITLE',
        'FC_HERO_BUTTON',
        'FC_OFFER1_TITLE',
        'FC_OFFER1_TEXT',
        'FC_OFFER2_TITLE',
        'FC_OFFER2_TEXT',
        'FC_OFFER3_TITLE',
        'FC_OFFER3_TEXT',
        'FC_STEP1',
        'FC_STEP2',
        'FC_STEP3',
        'FC_CTA_TITLE',
        'FC_CTA_BUTTON',
        'FC_BUSINESS_NAME',
        'FC_BUSINESS_CITY',
        'FC_BUSINESS_REGION',
        'FC_BUSINESS_COUNTRY',
        'FC_BUSINESS_PHONE',
        'FC_BUSINESS_EMAIL',
        'FC_BUSINESS_URL',
        'FC_BUSINESS_AREA',
    ];

    private const DEFAULT_VALUES = [
        'FC_HERO_TITLE' => 'Catering premium w Szczecinie',
        'FC_HERO_SUBTITLE' => 'Catering firmowy, eventy, lunch boxy. Dowozimy w Szczecinie i okolicach.',
        'FC_HERO_BUTTON' => 'Zapytaj o ofertę',
        'FC_OFFER1_TITLE' => 'Catering firmowy',
        'FC_OFFER1_TEXT' => '',
        'FC_OFFER2_TITLE' => 'Eventy i bankiety',
        'FC_OFFER2_TEXT' => '',
        'FC_OFFER3_TITLE' => 'Lunch boxy',
        'FC_OFFER3_TEXT' => '',
        'FC_STEP1' => '1) Kontakt',
        'FC_STEP2' => '2) Wycena',
        'FC_STEP3' => '3) Dostawa',
        'FC_CTA_TITLE' => 'Zamów catering na firmę lub event',
        'FC_CTA_BUTTON' => 'Skontaktuj się',
        'FC_BUSINESS_NAME' => 'ForestCatering',
        'FC_BUSINESS_CITY' => 'Szczecin',
        'FC_BUSINESS_REGION' => 'Zachodniopomorskie',
        'FC_BUSINESS_COUNTRY' => 'PL',
        'FC_BUSINESS_PHONE' => '',
        'FC_BUSINESS_EMAIL' => '',
        'FC_BUSINESS_URL' => '',
        'FC_BUSINESS_AREA' => 'Szczecin i okolice',
    ];

    public function __construct()
    {
        $this->name = 'fc_home';
        $this->tab = 'front_office_features';
        $this->version = '1.0.0';
        $this->author = 'ForestCatering';
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = 'ForestCatering Home Sections';
        $this->description = 'Editable homepage hero section for ForestCatering.';
    }

    public function install()
    {
        if (!parent::install()) {
            return false;
        }

        return $this->ensureHooks() && $this->createTables();
    }

    public function uninstall()
    {
        return parent::uninstall();
    }

    public function upgradeModule($version)
    {
        return $this->ensureHooks();
    }

    private function ensureHooks()
    {
        $hooks = ['displayHome', 'displayHomeTop', 'displayHeader'];

        foreach ($hooks as $hookName) {
            if ($this->isRegisteredInHook($hookName)) {
                continue;
            }

            if (!$this->registerHook($hookName)) {
                return false;
            }
        }

        return true;
    }

    private function createTables()
    {
        $sql = "CREATE TABLE IF NOT EXISTS `"._DB_PREFIX_."fc_home_data` (
            `id_fc_home` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id_fc_home`)
        ) ENGINE="._MYSQL_ENGINE_." DEFAULT CHARSET=utf8mb4;";

        return Db::getInstance()->execute($sql);
    }

    private function dropTables()
    {
        $sql = "DROP TABLE IF EXISTS `"._DB_PREFIX_."fc_home_data`;";
        return Db::getInstance()->execute($sql);
    }

    public function getContent()
    {
        $output = '';

        if (Configuration::get('FC_HOME_HOOKS_OK') !== '1') {
            if ($this->ensureHooks()) {
                Configuration::updateValue('FC_HOME_HOOKS_OK', '1');
            } else {
                $output .= $this->displayError($this->l('Could not ensure required hooks.'));
            }
        }

        if (Tools::isSubmit('submit_fc_home')) {
            $businessEmail = trim((string) Tools::getValue('FC_BUSINESS_EMAIL', ''));
            $businessPhone = trim((string) Tools::getValue('FC_BUSINESS_PHONE', ''));

            if ($businessEmail !== '' && strpos($businessEmail, '@') === false) {
                $output .= $this->displayError($this->l('Business email must contain "@".'));
                return $output.$this->renderForm();
            }

            if ($businessPhone !== '' && preg_match('/^[0-9 +]+$/', $businessPhone) !== 1) {
                $output .= $this->displayError($this->l('Business phone may contain only digits, spaces and "+".'));
                return $output.$this->renderForm();
            }

            foreach (self::CONFIG_KEYS as $key) {
                $value = (string) Tools::getValue($key, '');
                $value = trim(strip_tags($value));

                $storedValue = $this->getConfigValue($key);
                if ($value === '' && $storedValue === '' && isset(self::DEFAULT_VALUES[$key])) {
                    $value = self::DEFAULT_VALUES[$key];
                }

                if ($key === 'FC_BUSINESS_URL' && $value === '' && $storedValue === '') {
                    $value = $this->getDerivedBusinessUrl();
                }

                Configuration::updateValue($key, $value);
            }

            $output .= $this->displayConfirmation($this->l('Settings updated.'));
        }

        return $output.$this->renderForm();
    }

    public function hookDisplayHome()
    {
        return $this->renderHome();
    }

    public function hookDisplayHomeTop()
    {
        return $this->renderHome();
    }

    public function hookDisplayHeader()
    {
        $businessUrl = $this->getConfigValue('FC_BUSINESS_URL');
        if ($businessUrl === '') {
            $businessUrl = $this->getDerivedBusinessUrl();
        }

        $address = array_filter([
            '@type' => 'PostalAddress',
            'addressLocality' => $this->getConfigValue('FC_BUSINESS_CITY'),
            'addressRegion' => $this->getConfigValue('FC_BUSINESS_REGION'),
            'addressCountry' => $this->getConfigValue('FC_BUSINESS_COUNTRY'),
        ]);

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'LocalBusiness',
        ];

        $name = $this->getConfigValue('FC_BUSINESS_NAME');
        $phone = $this->getConfigValue('FC_BUSINESS_PHONE');
        $email = $this->getConfigValue('FC_BUSINESS_EMAIL');
        $areaServed = $this->getConfigValue('FC_BUSINESS_AREA');

        if ($name !== '') {
            $schema['name'] = $name;
        }

        if ($phone !== '') {
            $schema['telephone'] = $phone;
        }

        if ($email !== '') {
            $schema['email'] = $email;
        }

        if ($businessUrl !== '') {
            $schema['url'] = $businessUrl;
        }

        if (count($address) > 1) {
            $schema['address'] = $address;
        }

        if ($areaServed !== '') {
            $schema['areaServed'] = $areaServed;
        }

        $json = json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json === false) {
            return '';
        }

        return '<script type="application/ld+json">'.$json.'</script>';
    }

    private function renderHome()
    {
        $this->context->smarty->assign([
            'hero_title' => $this->getConfigValue('FC_HERO_TITLE'),
            'hero_subtitle' => $this->getConfigValue('FC_HERO_SUBTITLE'),
            'hero_button' => $this->getConfigValue('FC_HERO_BUTTON'),
            'offer1_title' => $this->getConfigValue('FC_OFFER1_TITLE'),
            'offer1_text' => $this->getConfigValue('FC_OFFER1_TEXT'),
            'offer2_title' => $this->getConfigValue('FC_OFFER2_TITLE'),
            'offer2_text' => $this->getConfigValue('FC_OFFER2_TEXT'),
            'offer3_title' => $this->getConfigValue('FC_OFFER3_TITLE'),
            'offer3_text' => $this->getConfigValue('FC_OFFER3_TEXT'),
            'step1' => $this->getConfigValue('FC_STEP1'),
            'step2' => $this->getConfigValue('FC_STEP2'),
            'step3' => $this->getConfigValue('FC_STEP3'),
            'cta_title' => $this->getConfigValue('FC_CTA_TITLE'),
            'cta_button' => $this->getConfigValue('FC_CTA_BUTTON'),
        ]);

        return $this->fetch('module:fc_home/views/templates/hook/home.tpl');
    }

    private function renderForm()
    {
        $fieldsForm = [
            'form' => [
                'legend' => [
                    'title' => $this->l('Homepage sections'),
                    'icon' => 'icon-home',
                ],
                'input' => [
                    ['type' => 'text', 'label' => $this->l('Hero title'), 'name' => 'FC_HERO_TITLE', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Hero subtitle'), 'name' => 'FC_HERO_SUBTITLE', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Hero button'), 'name' => 'FC_HERO_BUTTON', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Offer 1 title'), 'name' => 'FC_OFFER1_TITLE', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Offer 1 text'), 'name' => 'FC_OFFER1_TEXT', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Offer 2 title'), 'name' => 'FC_OFFER2_TITLE', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Offer 2 text'), 'name' => 'FC_OFFER2_TEXT', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Offer 3 title'), 'name' => 'FC_OFFER3_TITLE', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Offer 3 text'), 'name' => 'FC_OFFER3_TEXT', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Step 1'), 'name' => 'FC_STEP1', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Step 2'), 'name' => 'FC_STEP2', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Step 3'), 'name' => 'FC_STEP3', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('CTA title'), 'name' => 'FC_CTA_TITLE', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('CTA button'), 'name' => 'FC_CTA_BUTTON', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Business name'), 'name' => 'FC_BUSINESS_NAME', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Business city'), 'name' => 'FC_BUSINESS_CITY', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Business region'), 'name' => 'FC_BUSINESS_REGION', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Business country'), 'name' => 'FC_BUSINESS_COUNTRY', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Business phone'), 'name' => 'FC_BUSINESS_PHONE', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Business email'), 'name' => 'FC_BUSINESS_EMAIL', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Business URL'), 'name' => 'FC_BUSINESS_URL', 'required' => false],
                    ['type' => 'text', 'label' => $this->l('Business area served'), 'name' => 'FC_BUSINESS_AREA', 'required' => false],
                ],
                'submit' => [
                    'title' => $this->l('Save'),
                    'class' => 'btn btn-default pull-right',
                    'name' => 'submit_fc_home',
                ],
            ],
        ];

        $helper = new HelperForm();
        $helper->module = $this;
        $helper->name_controller = $this->name;
        $helper->identifier = $this->identifier;
        $helper->submit_action = 'submit_fc_home';
        $helper->currentIndex = AdminController::$currentIndex.'&configure='.$this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');

        foreach (self::CONFIG_KEYS as $key) {
            $value = $this->getConfigValue($key);
            if ($key === 'FC_BUSINESS_URL' && $value === '') {
                $value = $this->getDerivedBusinessUrl();
            }
            $helper->fields_value[$key] = $value;
        }

        return $helper->generateForm([$fieldsForm]);
    }

    private function getDerivedBusinessUrl()
    {
        if (method_exists('Tools', 'getShopDomainSsl')) {
            $url = (string) Tools::getShopDomainSsl(true);
            if ($url !== '') {
                return $url;
            }
        }

        if (method_exists('Tools', 'getShopDomain')) {
            return (string) Tools::getShopDomain(true);
        }

        return '';
    }

    private function getConfigValue($key)
    {
        $value = Configuration::get($key);

        if ($value === false || $value === null) {
            return '';
        }

        return (string) $value;
    }
}
