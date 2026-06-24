import {
  categories,
  cautionExperienceTags,
  companies,
  homeContent,
  positiveExperienceTags,
} from "../data/companies.js";

const CONFIG_KEY = "touqian-kankan-mini-content-config";

export const defaultContentConfig = {
  homeContent,
  categories,
  positiveExperienceTags,
  cautionExperienceTags,
  companies,
};

const cloneDefaultConfig = () => JSON.parse(JSON.stringify(defaultContentConfig));

const normalizeCategories = (savedCategories, fallbackCategories) => {
  const sourceCategories = savedCategories?.length ? savedCategories : fallbackCategories;
  const migratedCategories = sourceCategories.flatMap((category) =>
    category === "运营/市场" ? ["运营", "市场/品牌"] : [category],
  );
  const uniqueCategories = [...new Set(migratedCategories)];

  return uniqueCategories.includes("全部") ? uniqueCategories : ["全部", ...uniqueCategories];
};

const normalizeCompanyCategory = (category) => {
  if (category === "运营/市场") return "运营";
  return category || "运营";
};

const normalizeExperience = (experience, companyId, index) => ({
  ...experience,
  id: experience.id || `${companyId}-exp-${index}`,
  source: experience.source || "mock",
  tags: experience.tags || [],
  riskLevel: experience.riskLevel || "不确定",
  publishedAt: experience.publishedAt || new Date().toISOString().slice(0, 10),
});

const normalizeCompanies = (savedCompanies, fallbackCompanies) => {
  const sourceCompanies = savedCompanies?.length ? savedCompanies : fallbackCompanies;
  return sourceCompanies.map((company) => ({
    ...company,
    id: company.id || `company-${company.name}-${company.city}`,
    category: normalizeCompanyCategory(company.category),
    city: company.city?.trim() || "其他",
    experiences: (company.experiences || []).map((experience, index) =>
      normalizeExperience(experience, company.id || company.name, index),
    ),
  }));
};

const normalizeConfig = (config) => {
  const fallback = cloneDefaultConfig();
  return {
    homeContent: {
      ...fallback.homeContent,
      ...(config?.homeContent || {}),
      featureCards: config?.homeContent?.featureCards?.length
        ? config.homeContent.featureCards
        : fallback.homeContent.featureCards,
    },
    categories: normalizeCategories(config?.categories, fallback.categories),
    positiveExperienceTags: config?.positiveExperienceTags?.length
      ? config.positiveExperienceTags
      : fallback.positiveExperienceTags,
    cautionExperienceTags: config?.cautionExperienceTags?.length
      ? config.cautionExperienceTags
      : fallback.cautionExperienceTags,
    companies: normalizeCompanies(config?.companies, fallback.companies),
  };
};

export const readContentConfig = () => {
  try {
    const rawValue = window.localStorage.getItem(CONFIG_KEY);
    return rawValue ? normalizeConfig(JSON.parse(rawValue)) : cloneDefaultConfig();
  } catch {
    return cloneDefaultConfig();
  }
};

export const saveContentConfig = (config) => {
  const normalizedConfig = normalizeConfig(config);
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(normalizedConfig));
  return normalizedConfig;
};

export const clearContentConfig = () => {
  window.localStorage.removeItem(CONFIG_KEY);
  return cloneDefaultConfig();
};
