const STORAGE_KEY = "touqian-kankan-mini-experiences";

const categoryMap = {
  内容运营: "运营",
  消费品牌: "市场/品牌",
  "运营/市场": "运营",
  SaaS工具: "销售/商务",
  教育服务: "教育/培训",
  创意服务: "设计/创意",
};

const normalizeOldExperience = (experience) => ({
  ...experience,
  category: categoryMap[experience.category] || experience.category || "运营",
  city: experience.city?.trim() || "其他",
  tags: experience.tags || (experience.tag ? [experience.tag] : []),
  riskLevel: experience.riskLevel || "不确定",
});

export const readLocalExperiences = () => {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    const experiences = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(experiences) ? experiences.map(normalizeOldExperience) : [];
  } catch {
    return [];
  }
};

export const clearLocalExperiences = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};
