import { useState } from "react";
import { riskOptions } from "../data/companies.js";

const createBlankCompany = () => ({
  id: `admin-company-${Date.now()}`,
  name: "新公司",
  category: "运营",
  city: "城市待补充",
  stage: "团队阶段待补充",
  summary: "这里填写一段简短描述。",
  experiences: [],
});

const createBlankExperience = () => ({
  id: `admin-exp-${Date.now()}`,
  source: "mock",
  stage: "沟通中",
  roleName: "岗位待补充",
  riskLevel: "不确定",
  tags: [],
  content: "这里填写一条模拟体验。",
  reminder: "",
  publishedAt: new Date().toISOString().slice(0, 10),
});

const splitTags = (value) =>
  value
    .split(/[，,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

function EditableList({ title, items, onChange, requiredFirstItem }) {
  const updateItem = (index, value) => {
    onChange(items.map((item, currentIndex) => (currentIndex === index ? value : item)));
  };

  const deleteItem = (index) => {
    onChange(items.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <section className="admin-section">
      <div className="admin-section-title">
        <h2>{title}</h2>
        <button className="secondary-button compact-button" type="button" onClick={() => onChange([...items, "新选项"])}>
          新增
        </button>
      </div>

      <div className="admin-list">
        {items.map((item, index) => (
          <div className="admin-row" key={`${item}-${index}`}>
            <input
              value={item}
              disabled={requiredFirstItem && index === 0}
              onChange={(event) => updateItem(index, event.target.value)}
            />
            <button
              className="text-button"
              type="button"
              disabled={requiredFirstItem && index === 0}
              onClick={() => deleteItem(index)}
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminPage({ config, onConfigSaved, onConfigReset }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(config)));
  const [savedMessage, setSavedMessage] = useState("");

  const updateHome = (field, value) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      homeContent: {
        ...currentDraft.homeContent,
        [field]: value,
      },
    }));
  };

  const updateCompany = (companyIndex, field, value) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      companies: currentDraft.companies.map((company, index) =>
        index === companyIndex ? { ...company, [field]: value } : company,
      ),
    }));
  };

  const updateExperience = (companyIndex, experienceIndex, field, value) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      companies: currentDraft.companies.map((company, index) => {
        if (index !== companyIndex) return company;
        return {
          ...company,
          experiences: company.experiences.map((experience, currentIndex) =>
            currentIndex === experienceIndex ? { ...experience, [field]: value } : experience,
          ),
        };
      }),
    }));
  };

  const addCompany = () => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      companies: [...currentDraft.companies, createBlankCompany()],
    }));
  };

  const deleteCompany = (companyIndex) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      companies: currentDraft.companies.filter((_, index) => index !== companyIndex),
    }));
  };

  const addExperience = (companyIndex) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      companies: currentDraft.companies.map((company, index) =>
        index === companyIndex
          ? { ...company, experiences: [...(company.experiences || []), createBlankExperience()] }
          : company,
      ),
    }));
  };

  const removeExperienceFromDraft = (currentDraft, companyIndex, experienceIndex) => ({
    ...currentDraft,
    companies: currentDraft.companies
      .map((company, index) => {
        if (index !== companyIndex) return company;
        return {
          ...company,
          experiences: company.experiences.filter((_, currentIndex) => currentIndex !== experienceIndex),
        };
      })
      .filter((company) => (company.experiences || []).length > 0),
  });

  const deleteExperience = (companyIndex, experienceIndex, shouldSaveImmediately = false) => {
    const confirmed = window.confirm("确定删除这条体验吗？删除后无法恢复。");
    if (!confirmed) return;

    setDraft((currentDraft) => {
      const nextDraft = removeExperienceFromDraft(currentDraft, companyIndex, experienceIndex);
      if (shouldSaveImmediately) {
        onConfigSaved(nextDraft);
        setSavedMessage("体验已删除，并已同步到本地数据。");
      }
      return nextDraft;
    });
  };

  const saveDraft = () => {
    onConfigSaved(draft);
    setSavedMessage("已保存到浏览器本地。");
  };

  const updateCategories = (nextCategories) => {
    const fallbackCategory = nextCategories.find((category) => category !== "全部") || "运营";
    const categoryMap = draft.categories.reduce((result, category, index) => {
      result[category] = nextCategories[index] || category;
      return result;
    }, {});

    setDraft((currentDraft) => ({
      ...currentDraft,
      categories: nextCategories,
      companies: currentDraft.companies.map((company) => ({
        ...company,
        category: nextCategories.includes(categoryMap[company.category])
          ? categoryMap[company.category]
          : fallbackCategory,
      })),
    }));
  };

  const resetDraft = () => {
    const confirmed = window.confirm("确认恢复默认数据吗？本地配置和本地提交体验会被清空。");
    if (!confirmed) return;

    const defaultConfig = onConfigReset();
    setDraft(JSON.parse(JSON.stringify(defaultConfig)));
    setSavedMessage("已恢复默认数据，刷新后会看到内置 mock 内容。");
  };

  return (
    <main className="content-page admin-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Local Admin</span>
          <h1>内容管理</h1>
          <p>当前内容管理页仅用于本地原型调试，数据保存在浏览器 localStorage 中，不会同步到服务器。</p>
        </div>
      </div>

      <section className="admin-actions">
        <button className="primary-button" type="button" onClick={saveDraft}>
          保存配置
        </button>
        <button className="secondary-button" type="button" onClick={resetDraft}>
          恢复默认数据
        </button>
        {savedMessage ? <span>{savedMessage}</span> : null}
      </section>

      <section className="admin-section">
        <h2>首页文案</h2>
        <div className="admin-form-grid">
          <label>
            <span>首页主标题</span>
            <input value={draft.homeContent.title} onChange={(event) => updateHome("title", event.target.value)} />
          </label>
          <label>
            <span>首页副标题</span>
            <textarea
              value={draft.homeContent.subtitle}
              onChange={(event) => updateHome("subtitle", event.target.value)}
            />
          </label>
          <label>
            <span>首页投前提醒文案</span>
            <textarea
              value={draft.homeContent.reminder}
              onChange={(event) => updateHome("reminder", event.target.value)}
            />
          </label>
        </div>
      </section>

      <EditableList
        title="岗位方向"
        items={draft.categories}
        requiredFirstItem
        onChange={updateCategories}
      />

      <EditableList
        title="正向体验标签"
        items={draft.positiveExperienceTags}
        onChange={(positiveExperienceTags) =>
          setDraft((currentDraft) => ({ ...currentDraft, positiveExperienceTags }))
        }
      />

      <EditableList
        title="需要注意标签"
        items={draft.cautionExperienceTags}
        onChange={(cautionExperienceTags) => setDraft((currentDraft) => ({ ...currentDraft, cautionExperienceTags }))}
      />

      <section className="admin-section">
        <h2>体验管理</h2>
        <p className="admin-section-note">这里展示示例体验和本地发布体验。删除后会立即同步到 localStorage。</p>
        <div className="admin-experience-management">
          {draft.companies.map((company, companyIndex) =>
            (company.experiences || []).map((experience, experienceIndex) => (
              <article className="admin-experience-card" key={`${company.id}-${experience.id}`}>
                <div className="admin-experience-heading">
                  <strong>{company.name}</strong>
                  <span>{company.city} · {company.category}</span>
                  <span>{experience.source === "user" ? "本地发布" : "示例数据"}</span>
                </div>
                <div className="admin-experience-meta">
                  <span>风险：{experience.riskLevel}</span>
                  <span>标签：{(experience.tags || []).join("，") || "未填写"}</span>
                </div>
                <p>{experience.content}</p>
                <button
                  className="delete-text-button"
                  type="button"
                  onClick={() => deleteExperience(companyIndex, experienceIndex, true)}
                >
                  删除体验
                </button>
              </article>
            )),
          )}
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-title">
          <h2>示例公司数据</h2>
          <button className="secondary-button compact-button" type="button" onClick={addCompany}>
            新增公司
          </button>
        </div>

        <div className="admin-company-list">
          {draft.companies.map((company, companyIndex) => (
            <article className="admin-company-card" key={company.id}>
              <div className="admin-section-title">
                <h3>{company.name || "未命名公司"}</h3>
                <button className="text-button" type="button" onClick={() => deleteCompany(companyIndex)}>
                  删除公司
                </button>
              </div>

              <div className="admin-form-grid compact">
                <label>
                  <span>公司名称</span>
                  <input
                    value={company.name}
                    onChange={(event) => updateCompany(companyIndex, "name", event.target.value)}
                  />
                </label>
                <label>
                  <span>城市</span>
                  <input
                    value={company.city}
                    onChange={(event) => updateCompany(companyIndex, "city", event.target.value)}
                  />
                </label>
                <label>
                  <span>岗位方向</span>
                  <select
                    value={company.category}
                    onChange={(event) => updateCompany(companyIndex, "category", event.target.value)}
                  >
                    {draft.categories
                      .filter((category) => category !== "全部")
                      .map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                  </select>
                </label>
                <label>
                  <span>团队阶段</span>
                  <input
                    value={company.stage}
                    onChange={(event) => updateCompany(companyIndex, "stage", event.target.value)}
                  />
                </label>
              </div>

              <label className="admin-wide-label">
                <span>简短描述</span>
                <textarea
                  value={company.summary}
                  onChange={(event) => updateCompany(companyIndex, "summary", event.target.value)}
                />
              </label>

              <div className="admin-section-title nested">
                <h4>模拟体验</h4>
                <button className="secondary-button compact-button" type="button" onClick={() => addExperience(companyIndex)}>
                  新增体验
                </button>
              </div>

              <div className="admin-experience-list">
                {(company.experiences || []).map((experience, experienceIndex) => (
                  <div className="admin-experience-card" key={experience.id}>
                    <div className="admin-form-grid compact">
                      <label>
                        <span>求职阶段</span>
                        <input
                          value={experience.stage}
                          onChange={(event) =>
                            updateExperience(companyIndex, experienceIndex, "stage", event.target.value)
                          }
                        />
                      </label>
                      <label>
                        <span>岗位方向</span>
                        <input
                          value={experience.roleName}
                          onChange={(event) =>
                            updateExperience(companyIndex, experienceIndex, "roleName", event.target.value)
                          }
                        />
                      </label>
                      <label>
                        <span>风险程度</span>
                        <select
                          value={experience.riskLevel}
                          onChange={(event) =>
                            updateExperience(companyIndex, experienceIndex, "riskLevel", event.target.value)
                          }
                        >
                          {riskOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>发布时间</span>
                        <input
                          value={experience.publishedAt}
                          onChange={(event) =>
                            updateExperience(companyIndex, experienceIndex, "publishedAt", event.target.value)
                          }
                        />
                      </label>
                    </div>

                    <label className="admin-wide-label">
                      <span>体验标签，用中文逗号或英文逗号分隔</span>
                      <input
                        value={(experience.tags || []).join("，")}
                        onChange={(event) =>
                          updateExperience(companyIndex, experienceIndex, "tags", splitTags(event.target.value))
                        }
                      />
                    </label>

                    <label className="admin-wide-label">
                      <span>一句话体验</span>
                      <textarea
                        value={experience.content}
                        onChange={(event) =>
                          updateExperience(companyIndex, experienceIndex, "content", event.target.value)
                        }
                      />
                    </label>

                    <label className="admin-wide-label">
                      <span>给后来者的一句话提醒</span>
                      <input
                        value={experience.reminder || ""}
                        onChange={(event) =>
                          updateExperience(companyIndex, experienceIndex, "reminder", event.target.value)
                        }
                      />
                    </label>

                    <button
                      className="text-button"
                      type="button"
                      onClick={() => deleteExperience(companyIndex, experienceIndex, true)}
                    >
                      删除这条体验
                    </button>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default AdminPage;
