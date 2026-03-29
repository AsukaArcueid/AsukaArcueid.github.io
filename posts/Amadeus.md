# 简介
本项目主要用于学习并实践SFT、RL。目标是让模型在微调后能学会牧濑红莉栖的语气，同时有一些相关知识，类似原作中的Amadeus。目前计划微调完模型后给它配上agent框架让它成为一个可操作workspace的小助手，或许会以桌宠或原作中那种界面形式存在。
# 日志
## kurisu-v1
本地使用unsloth微调，dataset为从游戏中洗出来的部分对话。效果较差，一方面由于游戏对话过短、剧情相关、符号使用过多；另一方面由于本地unsloth提供的ui界面封装得太好，不知道有没有传入qwen系列的chat_template。既然不知道传没传，那就是没传（）。于是导致微调完的模型不断重复，无法正常停止输出。同时用ui的export功能貌似不生成Modelfile，为后续模型接入ollama带来了麻烦。

v1的dataset be like:
```
{"input": "所以说你的名字不是就叫克莉斯蒂娜嘛。", "output": "所以说！　我说了多少次我有一个好好的名字叫牧濑红莉栖啊！"}
{"input": "……咳，１４号机就是，电波jacker！", "output": "电波jacker？那是什么？"}
{"input": "不懂吗？物如其名，就是对电视发送的信号进行劫持干扰的装置。既然是天才少女，听到名字应该就明白了吧", "output": "电视发送的……原来如此，也就是broadcast signal intrusion吧？"}
```


![bd5c18362704d7848110354c8e024bc8](images/bd5c18362704d7848110354c8e024bc8.png)
                    图：神秘的预测下一个词并最终陷入问号循环的模型
                    
## kurisu-v2
依旧本地unsloth微调，dataset更新为中英文合成数据混合部分游戏内对话。同样出现无法停止生成、只会预测下一个词而无法分辨user和assistant的问题。输出中还出现用错的endoftext和im_start/im_end，更坐实apply_chat_template这一步出了问题的猜想。好笑的是这样只后可以用一个引子让模型把预训练的语料完全以接龙的形式背出来，深刻理解了为何有人研究用神经网络进行压缩。![665e6a1fd295a567c192fb0dc7d8a6ea](images/665e6a1fd295a567c192fb0dc7d8a6ea.png)
                          图：如何引出预训练数据（大雾

## kurisu-v3
意识到本地unsloth微调可能是问题的原因，再加之占用空间太多，改为线上unsloth微调。选用kaggle notebook，因为它每周免费提供30h的2 * T4 GPU额度，可以说非常大方，比起colab还多给了好点的cpu。不过一开始用的时候遇到了一点小问题：疑似由于安装流程不太对导致最后tensor形状有错误。现将能成功运行的代码附上（大部分来自于unsloth官方文档，我仅做了一些参数上的修改）：

配置环境
```
%%capture
import os, re
if "COLAB_" not in "".join(os.environ.keys()):
    !pip install unsloth  # Do this in local & cloud setups
else:
    import torch; v = re.match(r'[\d]{1,}\.[\d]{1,}', str(torch.__version__)).group(0)
    xformers = 'xformers==' + {'2.10':'0.0.34','2.9':'0.0.33.post1','2.8':'0.0.32.post2'}.get(v, "0.0.34")
    !pip install sentencepiece protobuf "datasets==4.3.0" "huggingface_hub>=0.34.0" hf_transfer
    !pip install --no-deps unsloth_zoo bitsandbytes accelerate {xformers} peft trl triton unsloth
!pip install transformers==4.56.2
!pip install --no-deps trl==0.22.2
```

选择model和对应tokenizer
```
from unsloth import FastLanguageModel
import torch

fourbit_models = [
    "unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit", # Qwen 14B 2x faster
    "unsloth/Qwen3-4B-Thinking-2507-unsloth-bnb-4bit",
    "unsloth/Qwen3-8B-unsloth-bnb-4bit",
    "unsloth/Qwen3-14B-unsloth-bnb-4bit",
    "unsloth/Qwen3-32B-unsloth-bnb-4bit",

    # 4bit dynamic quants for superior accuracy and low memory use
    "unsloth/gemma-3-12b-it-unsloth-bnb-4bit",
    "unsloth/Phi-4",
    "unsloth/Llama-3.1-8B",
    "unsloth/Llama-3.2-3B",
    "unsloth/orpheus-3b-0.1-ft-unsloth-bnb-4bit" # [NEW] We support TTS models!
] # More models at https://huggingface.co/unsloth

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Qwen3-4B-Instruct-2507",
    max_seq_length = 2048, # Choose any for long context!
    load_in_4bit = True,  # 4 bit quantization to reduce memory
    load_in_8bit = False, # [NEW!] A bit more accurate, uses 2x memory
    full_finetuning = False, # [NEW!] We have full finetuning now!
    # token = "YOUR_HF_TOKEN", # HF Token for gated models
)
```

配置model微调参数
```
model = FastLanguageModel.get_peft_model(
    model,
    r = 16, # Choose any number > 0 ! Suggested 8, 16, 32, 64, 128
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj",],
    lora_alpha = 16,
    lora_dropout = 0, # Supports any, but = 0 is optimized
    bias = "none",    # Supports any, but = "none" is optimized
    # [NEW] "unsloth" uses 30% less VRAM, fits 2x larger batch sizes!
    use_gradient_checkpointing = "unsloth", # True or "unsloth" for very long context
    random_state = 3407,
    use_rslora = False,  # We support rank stabilized LoRA
    loftq_config = None, # And LoftQ
)

```

配置tokenizer参数
```
from unsloth.chat_templates import get_chat_template
tokenizer = get_chat_template(
    tokenizer,
    chat_template = "qwen3-instruct",
)
```

加载dataset和evalset（其中path应填入kaggle input中给的path）
```
from datasets import load_dataset
dataset = load_dataset("json", data_files="PATH_TO_DATASET", split="train")
evalset = load_dataset("json", data_files="PATH_TO_EVALSET", split="train")
from unsloth.chat_templates import standardize_data_formats
dataset = standardize_data_formats(dataset)
evalset = standardize_data_formats(evalset)
def formatting_prompts_func(examples):
    # 获取 input 和 output 列表
    inputs = examples["input"]
    outputs = examples["output"]
    
    texts = []
    # 遍历每一行数据，将其转换为对话格式
    for i, o in zip(inputs, outputs):
        convo = [
            {"role": "user", "content": i},
            {"role": "assistant", "content": o},
        ]
        # 使用 tokenizer 应用模板，add_generation_prompt=False 因为我们已经有答案了
        texts.append(tokenizer.apply_chat_template(convo, tokenize=False, add_generation_prompt=False))
        
    return { "text" : texts }

# 应用映射
dataset = dataset.map(formatting_prompts_func, batched = True)
evalset = evalset.map(formatting_prompts_func, batched = True)
```

配置训练参数
```
from trl import SFTTrainer, SFTConfig
trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset,
    eval_dataset = evalset, # Can set up evaluation!
    args = SFTConfig(
        dataset_text_field = "text",
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4, # Use GA to mimic batch size!
        warmup_steps = 5,
        # num_train_epochs = 1, # Set this for 1 full training run.
        max_steps = 140,
        learning_rate = 1e-4, # Reduce to 2e-5 for long training runs
        logging_steps = 1,
        optim = "adamw_8bit",
        weight_decay = 0.001,
        lr_scheduler_type = "linear",
        seed = 3407,
        report_to = "none", # Use TrackIO/WandB etc
        eval_strategy = "steps",     # 开启按照步数验证
        eval_steps = 20,             # 每 20 步跑一次验证
        per_device_eval_batch_size = 2,
    ),
)
from unsloth.chat_templates import train_on_responses_only
trainer = train_on_responses_only(
    trainer,
    instruction_part = "<|im_start|>user\n",
    response_part = "<|im_start|>assistant\n",
)
```

训练
```
trainer_stats = trainer.train()
```

与微调后模型对话查看效果
```
messages = [
    {"role" : "user", "content" : "力的作用是相互的，那我扇我自己，为什么只有我一个人疼？这不符合物理定律吧？"}
]
text = tokenizer.apply_chat_template(
    messages,
    tokenize = False,
    add_generation_prompt = True, # Must add for generation
)

from transformers import TextStreamer
_ = model.generate(
    **tokenizer(text, return_tensors = "pt").to("cuda"),
    max_new_tokens = 1000, # Increase for longer outputs!
    temperature = 0.8, top_p = 0.8, top_k = 20, # For non thinking
    streamer = TextStreamer(tokenizer, skip_prompt = True),
)
```

保存模型权重
```
model.save_pretrained_gguf("kurisu1", tokenizer, quantization_method = "q4_k_m")
```

通过这段代码下载权重这种大文件
```
import os
from IPython.display import FileLink

# 1. 先确认文件到底在不在，打印出绝对路径
# 假设你的文件名包含 'gguf'
for root, dirs, files in os.walk('/kaggle/working'):
    for file in files:
        if 'gguf' in file:
            full_path = os.path.join(root, file)
            print(f"找到文件: {full_path}")
            
            # 2. 生成下载链接（FileLink 只接受相对路径）
            relative_path = os.path.relpath(full_path, '/kaggle/working')
            display(FileLink(relative_path))
```

用了代码确保流程完整之后，微调效果就好了不少。模型可以正常组织语言，也可以正确运用im_end等符号了。同时，模型也的确能够模仿傲娇语气了。现在的问题变成了模型微调时用的语料都偏短，且省略号太多，导致输出较短且很多时候只输出标点。![ebb8b2e3-d86c-4103-a0d1-41bce1ba7333](images/ebb8b2e3-d86c-4103-a0d1-41bce1ba7333.png)
                 图：模型学会了只输出省略号以降低loss的"作弊"方法

![50f9cfbd-dd21-456c-849a-8e997eeebe6e](images/50f9cfbd-dd21-456c-849a-8e997eeebe6e.png)
                         图：语气小测试，感觉还行（？

## kurisu-v4
鉴于模型长对话能力缺失以及输出标点（尤其是省略号）的概率过高，这次调整了一下dataset，在里面插入了一些[COIG-CQIA](https://huggingface.co/datasets/botp/COIG-CQIA/tree/main)中的数据（没错这个数据集里有弱智吧数据），同时清洗了一遍原有数据，将连续的省略号全部简化为"…"以减小模型不断输出省略号的概率。总的来说效果达到了，然而模型出现了融合度下降的问题——回答科学问题时语气像未微调过的ai，回答日常对话则是明显的微调后的语气。推测是由于长对话数据没有对output做对应的语气调整导致的，加之这次训练的step少了一点，可能仍欠拟合。并且英语对话时又出先无法停止的问题，原因未知。![32f389c2-a107-46d5-b3e1-78623cd18325](images/32f389c2-a107-46d5-b3e1-78623cd18325.png)
                图：可以用长文详细介绍内容，然而语气看不出微调过。