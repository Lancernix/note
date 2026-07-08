import type { Locale } from './i18n';

export const siteConfig = {
  name: 'Lancernix',
  shortName: 'Lancernix',
  description: '峰哥的个人网站：写作、项目与随笔。',
  author: {
    name: '峰哥',
    title: { en: 'Lancernix', 'zh-cn': '峰哥' },
    description: {
      en: 'Personal site of Lancernix.',
      'zh-cn': '写代码、做项目、记随笔。'
    },
    avatar: '/avatar.svg',
    social: [
      { name: 'GitHub', url: 'https://github.com/Lancernix', icon: 'lucide:github' },
      { name: 'Email', url: 'mailto:you@example.com', icon: 'lucide:mail' }
    ]
  },
  contentWidth: '48rem',
  ui: {
    navbar: {
      sticky: true
    },
    dock: {
      enabled: true
    }
  },
  nav: ['posts', 'projects', 'archives', 'tags', { label: { en: 'About', 'zh-cn': '关于' }, href: '/zh-cn/about/', icon: 'lucide:user' }],
  footerNav: ['archives', 'tags', { label: { en: 'About', 'zh-cn': '关于' }, href: '/zh-cn/about/', icon: 'lucide:user' }],
  comments: {
    enabled: true,
    provider: 'giscus',
    giscus: {
      repo: 'Lancernix/note',
      repoId: 'YOUR_REPO_ID',
      category: 'Announcements',
      categoryId: 'YOUR_CATEGORY_ID',
      mapping: 'pathname',
      strict: '0',
      reactionsEnabled: '1',
      emitMetadata: '0',
      inputPosition: 'bottom',
      theme: 'preferred_color_scheme'
    }
  },
  analytics: {
    enabled: false,
    provider: 'umami',
    umami: {
      src: '',
      websiteId: '',
      domains: ''
    }
  },
  gallery: {
    enabled: true,
    defaultLayout: 'justified',
    gap: 10,
    targetRowHeight: 220,
    lastRowBehavior: 'center',
    columnWidth: 220,
    columns: 'auto'
  },
  lightbox: {
    enabled: true
  },
  post: {
    relatedCount: 3,
    license: {
      enabled: true,
      name: 'CC BY-NC-SA 4.0',
      url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
      description: 'This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.'
    }
  }
} satisfies {
  name: string;
  shortName: string;
  description: string;
  author: {
    name: string;
    title: Record<Locale, string>;
    description: Record<Locale, string>;
    avatar: string;
    social: Array<{ name: string; url: string; icon: string }>;
  };
  contentWidth: string;
  ui: {
    navbar: {
      sticky: boolean;
    };
    dock: {
      enabled: boolean;
    };
  };
  nav: Array<string | { label: Record<Locale, string>; href: string; icon: string }>;
  footerNav: Array<string | { label: Record<Locale, string>; href: string; icon: string }>;
  comments: Record<string, any>;
  analytics: Record<string, any>;
  gallery: Record<string, any>;
  lightbox: Record<string, any>;
  post: Record<string, any>;
};
