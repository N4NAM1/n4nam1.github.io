# 简单学术主页 + 动态点线背景

这是一个普通的单页学术主页：白底、蓝色链接、按顺序展示简介、研究概述、教育经历、预印本、个人兴趣和联系方式。论文条目使用左图右文的紧凑布局。背景是蓝紫色立体点线网络，带缓慢旋转、节点光晕和沿线移动的光点。鼠标靠近时，附近节点会轻轻散开，移开后逐渐复位。

无需安装网站框架。解压后双击 `index.html` 即可预览，支持 GitHub Pages。

Beyond Research 中的 Favorite Music 使用 Spotify 官方播放接口，需要联网加载。点击封面开始播放，再点一次暂停；封面上的 ▶ 和 ❚❚ 表示播放状态。能否完整播放取决于访客的 Spotify 会话和浏览器环境，嵌入播放器有时只提供试听。Open in Spotify 可打开当前歌曲。

添加音乐时，在 `index.html` 的 `music-tracks` 中复制一个完整的 music-choice 按钮：data-track 填 Spotify 歌曲链接中 `/track/` 后的 ID，data-title 填完整歌名和作者，再更新按钮标签与 img 的封面地址。`music.js` 会同步更新播放器和 Open in Spotify 链接。若更换默认歌曲，也应同步修改 data-selected 和初始外链。增加曲目时可调整 CSS 的 grid-template-columns，让封面按合适列数排列。

## 文件说明

```text
academic-homepage/
├── index.html       改姓名、简介、研究概述、论文、邮箱
├── style.css        改颜色、字号和页面宽度
├── background.js    动态点线背景，一般不必修改
├── music.js         专辑封面按钮与播放器联动
├── .nojekyll        空文件，直接保留
├── README.md        本教程
└── assets/
    ├── avatar.svg              原始头像占位图
    ├── composegait-teaser.png  论文缩略图
    └── composegait.bib         arXiv 官方 BibTeX
```

## 1. 先在本地修改内容

用 VS Code 或记事本打开 `index.html`，修改标签中间的文字。文件中的中文注释标明了修改位置。保存为 UTF-8，刷新浏览器即可看到变化。

- 当前已填写姓名、身份、学校和个人简介；可按实际情况继续更新。
- 修改 Research Summary 中的研究概述，核心研究领域可用 strong 标签加粗。
- 已按 arXiv 信息补全 ComposeGait 条目；正式录用后更新发表状态，有新论文时复制 article 添加。
- 有具体项目时可新增 Projects 栏目，并在顶部添加对应导航。
- 填写联系方式及页脚更新时间。

### 添加链接

首页目前已有 Email、Google Scholar 和 GitHub 链接。准备好 CV 后，可在 `profile-links` 段落中继续添加链接，以 `/` 分隔。以下仅为语法示例，修改时保留现有真实地址：

```html
<a href="mailto:you@example.edu">Email</a>
<a href="https://github.com/YOUR_GITHUB_LOGIN">GitHub</a>
<a href="替换为你的GoogleScholar档案完整网址">Google Scholar</a>
<a href="assets/cv.pdf">CV</a>
```

先替换所有示例地址，CV 链接需要你将真实简历放到 `assets/cv.pdf`。没有的链接可以删掉。

### 换照片

将照片放到 `assets/photo.jpg`，把 `index.html` 中的 `assets/avatar.svg` 改成 `assets/photo.jpg`，并把 `alt` 改为你的姓名。建议用正方形照片。路径和文件名大小写要一致，不能写成电脑上的 `C:\...` 路径。

### 添加论文或项目

复制一个完整的 `<article class="publication">...</article>` 添加论文，放在 Selected Preprints 所在的 section 内，再替换这一条的缩略图、标题、作者、年份和链接。复制时也要修改 article 的 id，避免重复。当前没有 Projects section；添加项目时可参照论文区结构新增 `<section id="projects">`，并在 nav 中添加指向 `#projects` 的链接。

ComposeGait 缩略图使用[论文中的概览图](https://arxiv.org/html/2608.26632v2/fig1_teaser.png)。图像通过 CSS 缩小显示，保留原图内容；要换图，只需替换对应的 img 路径。

## 2. 调整动态背景

背景默认自动播放。如果保留 HTML 中的背景按钮，可通过右下角按钮暂停 / 播放；删除按钮不会影响动画运行。如果系统开启了减少动态效果，背景默认静止。手机最多使用 44 个点，桌面最多 120 个点；切到其他标签页时动画暂停。鼠标互动不会拦截正文点击或手机滚动。

打开 `background.js`，开头有四个设置：

| 设置 | 当前值 | 含义 |
| --- | --- | --- |
| density | 9000 | 数值越小，点越多；点数也有上限 |
| connection | 160 | 连线距离；越大越容易形成点线网络 |
| speed | 12 | 移动速度；越小越慢 |
| intensity | 1 | 点线亮度，建议 0.5–1.5；越大越明显 |

正文背景半透明，侧边的点线更明显。想让文字后面的线更明显，可在 `style.css` 中把 `.page` 的背景透明度 `.87` 改成 `.8`；手机对应 `.82`。想关闭背景，删除 HTML 里的 canvas、script 和背景按钮即可，正文仍能正常显示。

## 3. 创建 GitHub 仓库

1. 登录 [GitHub](https://github.com/)，确认自己的登录用户名，不是显示姓名。
2. 右上角 `+` → `New repository`，Owner 选个人账号。
3. 仓库名填 `你的登录用户名.github.io`，用小写。例如登录用户名为 `vision-researcher`，就填 `vision-researcher.github.io`。
4. 选择 `Public`，开启 `Add README`，点击 `Create repository`。这是使用 GitHub Free 的路线，仓库内容和主页将公开。
5. 已有同名仓库时，先检查并备份原有内容。

## 4. 上传文件

1. 仓库 `Code` 页面 → `Add file` → `Upload files`。
2. 上传解压后文件夹**里面的文件和 assets 文件夹**，不要上传 ZIP，也不要多套一层文件夹。
3. 确保仓库根目录直接看到 `index.html`、`style.css`、`background.js`、`assets/`。
4. `.nojekyll` 如果没有上传，可用 `Add file → Create new file` 创建，文件名填 `.nojekyll`，内容留空。
5. 填写提交说明，提交到 `main`。

## 5. 开启 Pages

准备好公开内容后，在 GitHub 操作：

1. 仓库 `Settings → Pages`。
2. Source 选择 `Deploy from a branch`。
3. Branch 选择 `main`，文件夹选择 `/(root)`。
4. 点击 `Save`。
5. 在 `Actions` 查看部署结果，或回到 Pages 点击网站链接。
6. 网站地址是 `https://你的登录用户名.github.io/`。发布更改可能需要几分钟。

参考：

- [GitHub 官方：创建 Pages 网站](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub 官方：配置发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 6. 后续更新

在 GitHub 打开 `index.html` → 点击编辑 → 修改 → `Commit changes`。提交到 main 后会自动重新部署。本地也可以先修改和预览，再上传。

| 问题 | 检查 |
| --- | --- |
| 404 | 仓库名、main / root 设置、根目录 index.html、Actions 部署状态 |
| 没有点线背景 | background.js 是否上传，文件名和 script 路径是否一致，右下角是否显示“播放背景” |
| 修改没有显示 | 是否保存并提交到 main；部署是否完成；刷新浏览器 |
| 照片不显示 | 是否上传，图片路径和大小写是否一致 |
| 链接点不了 | 是否将占位 span 换成了含真实 href 的 a 标签 |

本次只修改本地文件，没有连接、修改或发布你的 GitHub 仓库。请在发布前检查个人信息、论文条目和资源链接，将剩余占位文字替换或删除。
