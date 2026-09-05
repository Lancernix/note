import type { Locale } from '../config/i18n';

export const languages: Record<Locale, string> = {
  'zh-cn': '简体中文'
};

export const defaultLang: Locale = 'zh-cn';

export const ui = {
  'zh-cn': {
    'archive.description': '按发布日期排列的全部文章。',
    'archive.title': '归档',
    'dock.back': '返回上一页',
    'dock.home': '首页',
    'dock.top': '返回顶部',
    'home.featuredProjects': '精选项目',
    'home.recentPosts': '最近文章',
    'home.viewAll': '查看全部',
    'license.label': '版权许可',
    'nav.colorMode': '切换明暗模式',
    'nav.language': '语言',
    'nav.menu': '菜单',
    'nav.search': '搜索',
    'nav.theme': '主题',
    'notFound.action': '返回首页',
    'notFound.description': '你访问的页面不存在。',
    'notFound.title': '页面未找到',
    'posts.description': '笔记、随笔和技术写作。',
    'posts.title': '文章',
    'postNav.next': '下一篇',
    'postNav.previous': '上一篇',
    'projects.description': '精选项目、实验和作品记录。',
    'projects.title': '项目',
    'related.title': '相关文章',
    'series.description': '按顺序阅读同一系列的相关文章。',
    'series.title': '系列',
    'resume.experience': '工作经历',
    'resume.education': '教育背景',
    'resume.skills': '技能',
    'resume.certifications': '证书',
    'resume.languages': '语言能力',
    'taxonomy.count': '篇文章',
    'taxonomy.tagPrefix': '标签',
    'taxonomy.tagsDescription': '按标签浏览文章。',
    'taxonomy.tagsTitle': '标签',
    'search.close': '关闭搜索',
    'search.empty': '输入关键词开始搜索',
    'search.label': '搜索',
    'search.loading': '正在加载索引',
    'search.noResults': '没有找到结果',
    'search.placeholder': '搜索内容'
  }
} as const satisfies Record<Locale, Record<string, string>>;

export type UiKey = keyof (typeof ui)[typeof defaultLang];
