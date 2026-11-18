// ==UserScript==
// @name         GitHub 网页简体中文界面
// @namespace    https://github.com/zh18530914886-sudo/Frank-canGku
// @version      1.0.0
// @description  将 GitHub 网页中常见的英文界面文字替换为简体中文；不发送或修改任何 GitHub 数据。
// @author       zh18530914886-sudo
// @match        https://github.com/*
// @match        https://gist.github.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const translations = new Map([
    ['Dashboard', '仪表盘'], ['Home', '主页'], ['Explore', '探索'], ['Marketplace', '市场'],
    ['Pull requests', '拉取请求'], ['Issues', '议题'], ['Projects', '项目'], ['Discussions', '讨论'],
    ['Actions', '操作'], ['Security', '安全'], ['Insights', '洞察'], ['Settings', '设置'],
    ['Code', '代码'], ['Wiki', '百科'], ['Releases', '发行版'], ['Packages', '软件包'],
    ['Repositories', '仓库'], ['Stars', '星标'], ['Followers', '关注者'], ['Following', '正在关注'],
    ['Profile', '个人资料'], ['Your profile', '你的个人资料'], ['Your repositories', '你的仓库'],
    ['New repository', '新建仓库'], ['New', '新建'], ['Create repository', '创建仓库'],
    ['Search or jump to...', '搜索或跳转到…'], ['Type / to search', '输入 / 搜索'],
    ['Sign in', '登录'], ['Sign out', '退出登录'], ['Sign up', '注册'],
    ['Notifications', '通知'], ['View all notifications', '查看全部通知'],
    ['New issue', '新建议题'], ['New pull request', '新建拉取请求'],
    ['Open', '打开'], ['Closed', '已关闭'], ['Merged', '已合并'], ['Draft', '草稿'],
    ['Commits', '提交记录'], ['Branches', '分支'], ['Tags', '标签'], ['Contributors', '贡献者'],
    ['Compare', '比较'], ['Files changed', '更改的文件'], ['Conversation', '对话'],
    ['Review changes', '审查更改'], ['Request changes', '请求修改'], ['Approve', '批准'],
    ['Merge pull request', '合并拉取请求'], ['Create pull request', '创建拉取请求'],
    ['Edit', '编辑'], ['Delete', '删除'], ['Cancel', '取消'], ['Save', '保存'],
    ['Close issue', '关闭议题'], ['Reopen issue', '重新打开议题'],
    ['Submit new issue', '提交新议题'], ['Preview', '预览'], ['Write', '编写'],
    ['Labels', '标签'], ['Milestones', '里程碑'], ['Assignees', '受理人'],
    ['Watch', '关注'], ['Unwatch', '取消关注'], ['Fork', '派生'], ['Star', '加星'],
    ['Forks', '派生'], ['Watching', '正在关注'], ['Unstar', '取消星标'],
    ['About', '关于'], ['Readme', '自述文件'], ['License', '许可证'],
    ['Latest', '最新'], ['Latest commit', '最新提交'], ['History', '历史记录'],
    ['Go to file', '转到文件'], ['Add file', '添加文件'], ['Upload files', '上传文件'],
    ['Download ZIP', '下载 ZIP'], ['Clone', '克隆'], ['Copy', '复制'], ['Copied!', '已复制！'],
    ['Public', '公开'], ['Private', '私有'], ['Internal', '内部'],
    ['Loading', '正在加载'], ['Loading…', '正在加载…'], ['No results found', '未找到结果'],
    ['All', '全部'], ['Open a pull request', '打开拉取请求'], ['Open an issue', '打开议题'],
    ['This repository is empty.', '此仓库为空。'],
    ['There aren’t any open issues.', '没有打开的议题。'],
    ['There aren’t any open pull requests.', '没有打开的拉取请求。']
  ]);

  const attributes = ['aria-label', 'title', 'placeholder', 'data-tooltip'];
  const ignored = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE']);

  function translate(value) {
    const normalized = value.replace(/\s+/g, ' ').trim();
    const replacement = translations.get(normalized);
    if (!replacement) return null;
    const prefix = value.match(/^\s*/)?.[0] ?? '';
    const suffix = value.match(/\s*$/)?.[0] ?? '';
    return prefix + replacement + suffix;
  }

  function translateElement(element) {
    if (!(element instanceof HTMLElement) || ignored.has(element.tagName)) return;

    for (const attribute of attributes) {
      if (!element.hasAttribute(attribute)) continue;
      const result = translate(element.getAttribute(attribute) || '');
      if (result) element.setAttribute(attribute, result);
    }

    for (const node of element.childNodes) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      const result = translate(node.nodeValue || '');
      if (result) node.nodeValue = result;
    }
  }

  function translateTree(root) {
    if (root instanceof HTMLElement) translateElement(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) translateElement(walker.currentNode);
    const title = translate(document.title);
    if (title) document.title = title;
  }

  translateTree(document.body);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes' && record.target instanceof HTMLElement) {
        translateElement(record.target);
      }
      for (const node of record.addedNodes) {
        if (node instanceof HTMLElement) translateTree(node);
      }
    }
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: attributes
  });
})();
