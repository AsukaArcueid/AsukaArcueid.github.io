# 简介
blog_agent是基于OpenHands SDK实现的一个可以基于实验文件夹下的文件（如python程序、项目简介、各种数据集、实验结果等等）撰写项目博客的多智能体系统。它输出markdown格式的文件，可以用插件轻松转换为pdf格式文件。

# 项目结构
```
run.py (Entry)
    │
    ├─ Step 1: IdeaAgent      → Explore project, find papers, create outline
    ├─ Step 2: WriteAgent      → Write blog + generate graph method files
    ├─ Step 3: AnalyzeAgent    → Analyze & score (quality, SEO, E-E-A-T)
    ├─ Step 4: RefineAgent      → Loop improvement (until score > 90 or 3 iterations)
    └─ Step 5: ImageGen        → Generate images + replace <graphN> placeholders
```
如上所示，该项目共含有4个agent以及一个硬编码的图片处理逻辑。其中IdeaAgent充当浏览workspace并写大纲的角色，WriteAgent根据大纲提供初稿，后续的AnalyzeAgent和RefineAgent实现了一个简单的评估-修改循环，使输出更加稳定。ImageGen模块则会根据前面写好的生图prompt让生图模型生图，并提供可选的文字正确性检查和提取模板（即抹除文字）功能，让修改、利用ai生成的图片更加简单。

```
blog_agent/
├── agent/
│   └── new_base_agent.py      # BaseAgent using OpenHands SDK
├── config/
│   ├── config.yaml            # Configuration (API keys, settings)
│   └── loader.py              # Config loader
├── scripts/
│   └── run.py                 # Main entry point
├── skills/                    # 4 skill modules
│   ├── workspace-navigator/  # Project exploration & paper search
│   ├── blog-writer/          # Article writing
│   ├── blog-analyze/         # Quality analysis & scoring
│   └── blog-refine/          # Iterative improvement
├── tools/                     # OpenHands format tools
│   ├── search_paper_abstract_tool.py # Get paper abstract from Semantic Scholar
│   ├── download_paper_pdf_tool.py   # Download paper PDF
│   ├── count_words_tool.py           # Count words in markdown
│   ├── gengraph.py                   # Image generation via AI
│   ├── illustrate.py                  # High-level illustrate function
│   └── ocr.py                        # OCR text removal
└── utils/
    ├── semantic_scholar.py      # Semantic Scholar API utilities
    └── deeperaser.py           # Deep learning text removal
```
这便是整体的项目结构了。可见每个agent都有一个专属的skill。utils/deeperaser和gengraph的实现分别基于deeperaser项目和autofigure项目。

# 项目分析&经验
因为这个项目已经做完，大致结构也已经示出（应该还是易于理解的），代码实现也不困难，我想主要讲讲在真的编排、使用agent的时候遇到的一些问题以及经验。
## 1.为什么是OpenHands SDK？
首先来讲讲为什么我会选用OpenHands SDK。我感觉OpenAI SDK是目前被使用最广泛的SDK，那么OpenHands和它有什么区别呢？
### Skill
OpenHands SDK支持skills，这为开发agents提供了便利。正如我这个项目中展示的，对于一个需要中等自由度的Workflow，skill就是目前较好的解决方案。相对的，OpenAI SDK不支持，这使得写prompt、组合使用tools更为困难。
### Log
OpenHands SDK 默认集成了事件流，将 Thought -> Action -> Observation的循环原生可视化。相比于在 OpenAI SDK 中通过hooks截取事件，OpenHands 让开发者能更简单地以‘第一视角’监控 Agent 的决策过程，这对于复杂逻辑的溯源是至关重要的。
### Subagent
OpenHands SDK可以让你更简单地实现subagent，这对某些需要层级架构的多智能体系统很关键。这种天然的解耦是 OpenAI SDK 这种扁平化接口难以优雅实现的。

### Docker
选择 OpenHands 的另一个不可忽视的理由是它内置了 Docker 沙箱隔离。在 OpenAI 的生态下，执行代码需要自己搭建环境、处理权限；而 OpenHands 将‘思考’与‘执行环境’深度耦合，提供了一个安全的、可撤销的指令执行空间。

总的来说，OpenAI SDK 提供了最强的点状能力，而 OpenHands SDK 提供了最完整的线性流程。对于我这个追求中等自由度、强调执行反馈的小项目，OpenHands 减少了约 60% 的脚手架代码编写，让我能更专注于 Agent 逻辑本身。当然，如果你想自己管理memory，自己完成上下文工程，OpenAI SDK是更自由的选择。

## 2.怎么分配agent职能？
虽然可以让一个agent挂载所有skill和tool，但是这样它的上下文容易爆炸，过长的任务链也容易累积出错的概率，让结果非常差劲。因此，我们需要多个agent，并且像人类小组中分配任务一样给它们分配任务、确定目标。我觉得分配的技巧有以下几点：
### 一个agent只做相似的事
不论是生成subagent还是将任务分开交给独立agent，你都会发现最终一个agent做的是相同的事。这样的原因是当一个agent同时干太多的事时，不同的tool description、tool返回的结果、自己的思考链都会多少污染上下文，让它的动作逐渐偏离预设。因此让一个agent专精一件事并以一个最终目的来调tool、看skill是最好的

### 选择合适大小的任务
一个任务不应该太大，也不应该太小（废话来了）。例如，我不能直接让agent写blog，因为我对blog的格式、内容有要求，直接写容易漂移。我也不能让一个agent专门下载论文，因为这太简单了，就是调个tool的事，没法发挥react的实力。因此，一个有单一的大目标，且确实可以拆分为5-6个步骤的任务就比较合适。（例：读这篇博客，按skill中给出的标准给它打分…………）

### 根据具体模型和框架能力选择
做agent时SDK和模型均会影响最后的结果。显然都用顶级模型对钱包是不小的一笔损耗。因此根据预算中模型能力选择合适的职能也很重要（其实也可以反过来想，根据具体任务选择合适模型）。例如用opus、gpt可以把任务定大一点，skill粗一点，然而如果用minimax就要细致一点。总之就是具体情况具体分析，跑几次基本就知道该怎么分了。


## 3.为何这么设计workflow？
当使用多agent时，设计workflow就非常重要了。一个好的workflow可以使agent相互补足，达到协作的效果，然而不好的workflow就没法让多agent发挥真正的实力，有时候删删改改还不如只用一个，白花钱。我用这个blog agent的workflow为例写点我对如何选择、设计workflow的理解。
### 由任务驱动
设计workflow必然是要适配最终的任务和目的的。一个任务需要的创造力、自由度和workflow息息相关。workflow应该能够用结构来调控整个任务的进行，从而掌控那些LLM本身无法确保的东西。

比如这个blog agent，我希望blog中有TL;DR、introduction、brief view、detail等等几个板块，并且每个版块里的内容梗概也较为确定，只是具体的需要根据项目动态调整。这就属于流程较为固定的任务，我也不希望出大的偏差，便选用线性workflow。由于技术博客需要严谨性，单轮流程无法保证ai不出幻觉，于是我就在线性的基础上增加审查修改循环，以workflow结构来优化内容，让其少出错。

又比如要做一个提idea的agent系统，这时需要有创造力，而输出不需要那么条条框框，便可以选用简单的roundrobin轮询实现“头脑风暴”。但是这样又有可能遇到循环逻辑太单一的问题，无法有效轮询。此时便可稍作修改，使用mailbox式状态机来当workflow，给每个agent定个人设让它从某方面考虑问题，每个agent有自主发邮件的能力，多agent并行，最终实现提idea这个创造性目标。

### 在workflow中引入”环“
当实际上手时，你会发现，对于LLM这种不确定性极大的工具，光靠单一线性的workflow是难以驾驭的。这时候就要想想如何让workflow闭环。这种环小的有ReAct里的Thought -> Action -> Observation循环，大一点的有类似blog agent里由agent构成的循环。其实这些东西的本质就是要让LLM能收到上一次输出的反馈——观察上文举过的例子，可以发现ReAct里通过observation作为上下文重新喂给LLM构成了环；mailbox通过别的agent收到消息后可能经过一系列状态转换最终又有消息传回来构成了环；analysis-refine循环更是直接的反馈（虽然其实memory没共享，反馈的不够彻底）。因此，把LLM装进环里吧。

### 善于不用agent
如果你发现最后一个模块并未用到agent并产生了为何不用的疑惑，这一段或许能解答你的疑惑。agent固然很强大，然而对于极度确定的工作，使用agent带来的是负收益。在生图过程中，我要做的只是根据图片描述文件生图，然后修改文章占位符让其链接图片，顶多再加一个对每张图片进行文字抹除。你当然可以写一个skill让agent做这几件事，但写死的脚本也可以，还能保证结果正确，甚至再省点钱。因此，只在需要主动性、涉及价值判断这些写死的代码解决不了的事时调LLM。这会让你的程序更快、更好。


## 4.prompt/skill怎么写？
对于这一点，我倒不想长篇大论。一是未来LLM能力肯定会越来越强，对于任务的理解也肯定越来越完善，那时prompt/skill就统统随便写了。可惜现在还不能这样。那一个还不错的prompt/skill究竟长什么样？
### 有逻辑性及时序性
假如你是要让agent做某件事，逻辑性是非常重要的。你的skill应当有较明确的结构（如写清楚一级标题、二级标题等等），这样ai易于理解主次和包含。另外，假如你想用skill包含一套workflow，一定要确保它的顺序较为正确。毕竟根据一个列好第一步做啥，第二步做啥的东西做总归更轻松，LLM也不例外。

### 示例（one shot/few shots）
如果你想要某个较确定的输出（如确定的格式/语气等等），除了描述，示例也非常重要。在prompt/skill中加上示例或许比十句描述更管用——百闻不如一见。

能做到以上两点，相信LLM就有很大概率乖乖听话了——这和与人说话也没啥不同，对吧？应该不算难。


# 一些别的想法
以上就是我对于agent的一些浅薄理解，理论上这篇文章也该结束了。不过做这个项目的时候，除了技术上的一些理解，我还有些更深的感触，就写在这吧。

首先就是，技术发展的真快啊。这个项目我基本都是claude code+minimax写的。这都不是最顶级的模型，用起来依旧丝滑，让人觉得不管有什么想法似乎都能实现。或许人真的在ai的加持下能变得”无所不能“吧。

其次就是一些消极的东西了。在了解agent的过程中，我发现这个领域迭代的非常快。很多架构都不是被更好的架构、方法击垮的，而是被新的模型击垮。当你勤勤恳恳做memory管理、上下文工程，结果明天新的模型上下文翻了一番，你发现所有东西直接塞进prompt比什么RAG、裁切都有效，心中会是什么感受呢？我不敢想，也不想感受。

乃至ai研究，也经常出现”撞车“。好的idea不多，做的人不少。比如科研agent，我少说看到了3、4个。如果别人先发布了，你发现它做的没自己好，这自然还行。但如果别人发布的早，效果又好，那你失去的时间该如何舍得？我不知道。

更加令人无奈的就是大公司，如Anthropic、OpenAI、Google等在创新和工程化中展现的垄断实力。当你做一个依赖于LLM的项目，你依赖的是现在发布了的LLM。但是它们不是。我相信它们内部在做项目时，依赖的是正在开发中的，更新更强的LLM的目标能力。如此一来，它们不会浪费时间重复造轮子，本就高的效率更高，而非公司的个体或许会发现，辛辛苦苦做了半天的东西成为了下一个模型/框架的内置能力。此时又当如何？我也没有头绪。

我并没有真正做过科研，或许这些担忧现在来看是杞人忧天。但我觉得即使现在还好，以后也必将出现这些情况。到那时没钱没信息的研究者又将如何？我想这个问题需要有个答案。


# 附：
最近claude code不是被意外开源了吗，里面有个swarm模式与上述mailbox很相似。我感觉这个的简单实现还挺适合作为多agent项目练练手的，如果有人对agent感兴趣可以先试着写写这个（？