import enUS from 'antd-mobile/lib/locale-provider/en_US';
import appLocaleData from 'react-intl/locale-data/en';
import en from './en';

window.appLocale = {
  messages: {...en},
  antd: enUS,
  locale: 'en-US',
  data: appLocaleData,
}
