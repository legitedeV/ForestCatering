<?php

if (!defined('_PS_VERSION_')) {
    exit;
}

class Fc_Home extends Module
{
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
        return parent::install()
            && $this->registerHook('displayHome')
            && $this->createTables();
    }

    public function uninstall()
    {
        return $this->dropTables()
            && parent::uninstall();
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
        if (Tools::isSubmit('submit_fc_home')) {
            Configuration::updateValue('FC_HERO_TITLE', Tools::getValue('FC_HERO_TITLE'));
            Configuration::updateValue('FC_HERO_SUBTITLE', Tools::getValue('FC_HERO_SUBTITLE'));
            Configuration::updateValue('FC_HERO_BUTTON', Tools::getValue('FC_HERO_BUTTON'));
        }

        $title = Configuration::get('FC_HERO_TITLE');
        $subtitle = Configuration::get('FC_HERO_SUBTITLE');
        $button = Configuration::get('FC_HERO_BUTTON');

        return '\n        <form method="post">\n            <div class="form-group">\n                <label>Hero Title</label>\n                <input type="text" name="FC_HERO_TITLE" value="'.htmlspecialchars($title).'" class="form-control">\n            </div>\n            <div class="form-group">\n                <label>Hero Subtitle</label>\n                <textarea name="FC_HERO_SUBTITLE" class="form-control">'.htmlspecialchars($subtitle).'</textarea>\n            </div>\n            <div class="form-group">\n                <label>Hero Button Text</label>\n                <input type="text" name="FC_HERO_BUTTON" value="'.htmlspecialchars($button).'" class="form-control">\n            </div>\n            <button type="submit" name="submit_fc_home" class="btn btn-primary">Save</button>\n        </form>';
    }

    public function hookDisplayHome()
    {
        $this->context->smarty->assign([
            'hero_title' => Configuration::get('FC_HERO_TITLE'),
            'hero_subtitle' => Configuration::get('FC_HERO_SUBTITLE'),
            'hero_button' => Configuration::get('FC_HERO_BUTTON'),
        ]);

        return $this->fetch('module:fc_home/views/templates/hook/home.tpl');
    }
}
