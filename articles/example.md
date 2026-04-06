# 示例笔记

这是一条示例笔记，用来测试笔记页面是否正常工作。

## 使用说明

在 `db.js` 的 `NOTES_DB` 中添加笔记条目，格式如下：

```javascript
{
    id: 2,
    title: "笔记标题",
    date: "2026-04-06",
    intro: "简短介绍，一句话说明这篇笔记讲了什么",
    summary: "正文预览，hover 卡片时显示的内容",
    path: "articles/your-note.md"
}
```

对应的 `.md` 文件放在 `articles/` 目录下，图片放在 `article_images/` 目录下，文章内引用图片时使用相对路径：

```markdown
![描述](./article_images/image.png)
```

注意路径是相对于生成的 HTML 页面而言的，所以要用 `./article_images/` 而不是 `article_images/`。

## 笔记分类建议

- 上课感悟：记录某节课的核心收获和思考
- 论文笔记：Paper 速读，记录方法、贡献和启发
