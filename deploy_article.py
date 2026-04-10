import os
import re

# 配置路径
ARTICLES_DIR = 'articles'
# Obsidian 语法正则: ![[图片名.png|可选宽度]]
# 我们要把它转为: ![图片名](article_images/图片名.png)
OBSIDIAN_IMG_RE = r'!\[\[(.*?)(\.(png|jpg|jpeg|gif|webp))(?:\|.*?)?\]\]'

def transform_md_files():
    if not os.path.exists(ARTICLES_DIR):
        print(f"找不到文件夹: {ARTICLES_DIR}")
        return

    for filename in os.listdir(ARTICLES_DIR):
        if filename.endswith('.md'):
            file_path = os.path.join(ARTICLES_DIR, filename)

            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # 执行替换：将 ![[name.ext|width]] 替换为 ![name](../article_images/name.ext)
            new_content = re.sub(OBSIDIAN_IMG_RE, r'![\1](../article_images/\1\2)', content)

            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"✅ 已优化路径: {filename}")
            else:
                print(f"文字内容无变化: {filename}")

if __name__ == "__main__":
    transform_md_files()
    print("所有处理已完成。")
