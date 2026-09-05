import { getLocalePath, type Locale } from './i18n';
import { contentTypes } from './content';
import { siteConfig } from './site';

export type NavigationConfigItem = string | {
  label: Record<Locale, string>;
  href: string;
  icon: string;
};

const systemRoutes = {
  archives: {
    label: { 'zh-cn': '归档' },
    href: '/archives/',
    icon: 'lucide:archive'
  },
  tags: {
    label: { 'zh-cn': '标签' },
    href: '/tags/',
    icon: 'lucide:tags'
  },
  series: {
    label: { 'zh-cn': '系列' },
    href: '/series/',
    icon: 'lucide:bookmark'
  },
  resume: {
    label: { 'zh-cn': '简历' },
    href: '/resume/',
    icon: 'lucide:file-text'
  }
} satisfies Record<string, {
  label: Record<Locale, string>;
  href: string;
  icon: string;
}>;

const routeRegistry = {
  ...Object.fromEntries(Object.entries(contentTypes).map(([id, config]) => [id, {
    label: config.label,
    href: config.path,
    icon: config.icon
  }])),
  ...systemRoutes
} as Record<string, {
  label: Record<Locale, string>;
  href: string;
  icon: string;
}>;

function resolveNavigationItem(item: NavigationConfigItem) {
  if (typeof item !== 'string') return item;
  return routeRegistry[item];
}

function resolveHref(locale: Locale, href: string) {
  if (/^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
    return href;
  }
  return getLocalePath(locale, href);
}

export function getNavigation(locale: Locale, items: NavigationConfigItem[] = siteConfig.nav) {
  return items
    .map(resolveNavigationItem)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      href: resolveHref(locale, item.href),
      label: item.label[locale],
      icon: item.icon
    }));
}

export function getFooterNavigation(locale: Locale) {
  return getNavigation(locale, siteConfig.footerNav);
}
