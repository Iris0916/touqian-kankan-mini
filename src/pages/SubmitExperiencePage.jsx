import { useState } from "react";
import { cityOptions, riskOptions } from "../data/companies.js";

const maxTagCount = 5;

const initialForm = {
  companyName: "",
  cityOption: "",
  customCity: "",
  category: "运营",
  roleName: "",
  stage: "沟通中",
  riskLevel: "不确定",
  tags: [],
  content: "",
  reminder: "",
};

function SubmitExperiencePage({
  companies,
  categories,
  positiveExperienceTags,
  cautionExperienceTags,
  goTo,
  onExperienceSaved,
}) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tagHint, setTagHint] = useState("");

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const toggleTag = (tag) => {
    setForm((currentForm) => {
      if (currentForm.tags.includes(tag)) {
        setTagHint("");
        return {
          ...currentForm,
          tags: currentForm.tags.filter((currentTag) => currentTag !== tag),
        };
      }

      if (currentForm.tags.length >= maxTagCount) {
        setTagHint("最多选择 5 个标签，保留最关键的体验就好。");
        return currentForm;
      }

      setTagHint("");
      return {
        ...currentForm,
        tags: [...currentForm.tags, tag],
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // 业务逻辑：Mini 版本只把体验保存到浏览器本地；同公司合并由 App 层统一处理。
    const hasRequiredFields =
      form.companyName.trim() &&
      (form.cityOption === "其他" ? form.customCity.trim() : form.cityOption) &&
      form.roleName.trim() &&
      form.content.trim() &&
      form.riskLevel &&
      form.tags.length > 0;
    if (!hasRequiredFields) {
      if (!form.tags.length) setTagHint("请至少选择 1 个体验标签。");
      return;
    }

    onExperienceSaved({
      companyName: form.companyName.trim(),
      city: form.cityOption === "其他" ? form.customCity.trim() : form.cityOption,
      category: form.category,
      roleName: form.roleName.trim(),
      stage: form.stage,
      riskLevel: form.riskLevel,
      tags: form.tags,
      content: form.content.trim(),
      reminder: form.reminder.trim(),
    });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <main className="content-page">
        <section className="success-card">
          <span className="success-mark">✓</span>
          <h1>提交成功</h1>
          <p>这条体验已保存到你的浏览器本地记录里。若公司已存在，会合并到同一家公司详情中。</p>
          <div className="success-actions">
            <button className="primary-button" type="button" onClick={() => goTo("/companies")}>
              查看公司列表
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setForm(initialForm);
                setTagHint("");
                setIsSubmitted(false);
              }}
            >
              再写一条
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="content-page form-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Share A Note</span>
          <h1>发布体验</h1>
          <p>填写一条简短体验，帮助后来的人在投递前多一点参考。</p>
        </div>
      </div>

      <section className="guideline-box">
        请分享真实经历，尽量描述具体事实。请勿发布个人姓名、手机号、微信号、身份证、住址、私人照片等个人信息。请避免辱骂、攻击性表达。
      </section>

      <form className="experience-form" onSubmit={handleSubmit}>
        <label>
          <span>公司名称</span>
          <input
            list="company-options"
            value={form.companyName}
            onChange={(event) => updateField("companyName", event.target.value)}
            placeholder="例如：青桥内容实验室"
            required
          />
        </label>
        <datalist id="company-options">
          {companies.map((company) => (
            <option key={company.id} value={company.name} />
          ))}
        </datalist>

        <div className="form-pair">
          <label>
            <span>城市</span>
            <select
              value={form.cityOption}
              onChange={(event) => updateField("cityOption", event.target.value)}
              required
            >
              <option value="">请选择城市</option>
              {cityOptions.map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
          </label>

          {form.cityOption === "其他" ? (
            <label>
              <span>自定义城市</span>
              <input
                value={form.customCity}
                onChange={(event) => updateField("customCity", event.target.value)}
                placeholder="请输入城市名称"
                required
              />
            </label>
          ) : null}
        </div>

        <label>
          <span>岗位方向</span>
          <select value={form.category} onChange={(event) => updateField("category", event.target.value)}>
            {categories
              .filter((category) => category !== "全部")
              .map((category) => (
                <option key={category}>{category}</option>
              ))}
          </select>
        </label>

        <label>
          <span>具体岗位</span>
          <input
            value={form.roleName}
            onChange={(event) => updateField("roleName", event.target.value)}
            placeholder="例如：运营助理、销售顾问、教务实习生"
            required
          />
        </label>

        <div className="form-pair">
          <label>
            <span>体验阶段</span>
            <select value={form.stage} onChange={(event) => updateField("stage", event.target.value)}>
              <option>沟通中</option>
              <option>面试后</option>
              <option>试稿后</option>
            </select>
          </label>

          <label>
            <span>你认为这次体验的风险程度是？</span>
            <select value={form.riskLevel} onChange={(event) => updateField("riskLevel", event.target.value)} required>
              {riskOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="tag-fieldset">
          <legend>体验标签</legend>
          <p>可以多选，最多选择 5 个。</p>

          <div className="tag-choice-group">
            <span>正向体验</span>
            <div className="tag-choice-list">
              {positiveExperienceTags.map((tag) => (
                <button
                  key={tag}
                  className={form.tags.includes(tag) ? "tag-choice active" : "tag-choice"}
                  type="button"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="tag-choice-group">
            <span>需要注意</span>
            <div className="tag-choice-list">
              {cautionExperienceTags.map((tag) => (
                <button
                  key={tag}
                  className={form.tags.includes(tag) ? "tag-choice active caution" : "tag-choice caution"}
                  type="button"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {tagHint ? <p className="form-soft-error">{tagHint}</p> : null}
        </fieldset>

        <label>
          <span>体验内容</span>
          <textarea
            value={form.content}
            onChange={(event) => updateField("content", event.target.value)}
            placeholder="简单写一下你观察到的沟通方式、流程、岗位边界或需要注意的地方。"
            required
          />
        </label>

        <label>
          <span>给后来者的一句话提醒</span>
          <input
            value={form.reminder}
            onChange={(event) => updateField("reminder", event.target.value)}
            placeholder="比如：建议问清楚试用期工资、是否免费试岗、谁负责带新人。"
          />
        </label>

        <button className="primary-button form-submit" type="submit">
          提交体验
        </button>
      </form>
    </main>
  );
}

export default SubmitExperiencePage;
