import { cautionExperienceTags, positiveExperienceTags } from "../data/companies.js";

const defaultReminder = "不急着下判断，先把薪资、职责、流程和试用期问清楚。";

const tagRules = {
  薪资模糊: {
    observe: "关注薪资结构、试用期工资和绩效规则",
    action: "投递前问清楚薪资组成、试用期工资和绩效计算方式",
  },
  岗位模糊: {
    observe: "关注每天具体做什么，以及任务边界是否清楚",
    action: "继续聊之前先确认岗位日常任务和主要负责人",
  },
  试岗较长: {
    observe: "关注试岗周期、试岗产出是否会被使用",
    action: "提前确认试岗时长、交付标准和反馈方式",
  },
  免费方案: {
    observe: "关注试稿或试岗是否有合理补偿",
    action: "问清楚是否免费试稿，以及成果是否会被实际使用",
  },
  面试压迫: {
    observe: "关注沟通方式和团队氛围是否适合自己",
    action: "如果沟通体验明显不适，可以放慢推进节奏",
  },
  流程混乱: {
    observe: "关注招聘流程、反馈节点和对接人是否清楚",
    action: "建议确认下一步流程、时间点和负责反馈的人",
  },
  加班暗示: {
    observe: "关注工作时间、临时需求和加班补偿规则",
    action: "投递前问清楚加班频率、调休和补偿方式",
  },
  职责过宽: {
    observe: "关注岗位职责是否超过原本方向",
    action: "提前确认核心职责，以及哪些任务只是偶尔协助",
  },
  流程清晰: {
    observe: "可以关注后续反馈速度和试用期安排",
    action: "继续确认试用期安排和转正标准",
  },
  适合新手: {
    observe: "可以关注是否有人带、反馈是否具体",
    action: "建议问清楚新人培训方式和日常反馈频率",
  },
  反馈清楚: {
    observe: "可以关注直属负责人是否稳定",
    action: "可以进一步确认入职后的对接人和反馈方式",
  },
  薪资明确: {
    observe: "可以关注薪资承诺是否写入正式沟通材料",
    action: "建议确认薪资结构、发放时间和试用期是否一致",
  },
  HR友好: {
    observe: "可以关注后续业务面沟通是否同样清楚",
    action: "进入下一轮前继续确认岗位职责和考核方式",
  },
  任务明确: {
    observe: "可以关注任务优先级和交付标准是否稳定",
    action: "建议确认入职后第一个月的核心目标",
  },
};

export const normalizeCompanyName = (name) => name.trim().toLowerCase();
export const normalizeCityName = (city) => city.trim();
const getCompanyMergeKey = (name, city) => `${normalizeCompanyName(name)}__${normalizeCityName(city)}`;

const countBy = (items) =>
  items.reduce((result, item) => {
    result[item] = (result[item] || 0) + 1;
    return result;
  }, {});

const topTags = (experiences, sourceTags) => {
  const tagCounts = countBy(experiences.flatMap((experience) => experience.tags || []));
  return sourceTags
    .filter((tag) => tagCounts[tag])
    .sort((first, second) => tagCounts[second] - tagCounts[first])
    .slice(0, 3);
};

export const getRiskDistribution = (experiences) => {
  const distribution = { 低: 0, 中: 0, 高: 0, 不确定: 0 };
  experiences.forEach((experience) => {
    const riskLevel = experience.riskLevel || "不确定";
    distribution[riskLevel] = (distribution[riskLevel] || 0) + 1;
  });
  return distribution;
};

export const getRiskSummaryText = (experiences) => {
  if (experiences.length <= 1) return "暂不形成整体判断";

  const distribution = getRiskDistribution(experiences);
  const riskEntries = Object.entries(distribution).sort((first, second) => second[1] - first[1]);
  const [topRisk, topCount] = riskEntries[0];
  const isScattered = riskEntries.filter(([, count]) => count === topCount).length > 1;

  if (topRisk === "不确定" || isScattered) return "反馈仍需观察";
  if (topRisk === "高") return "风险反馈偏高";
  if (topRisk === "中") return "风险反馈偏中";
  return "风险反馈偏低";
};

export const getOverallImpression = (company, tagConfig = {}) => {
  const { experiences } = company;
  const positiveTags = topTags(experiences, tagConfig.positiveExperienceTags || positiveExperienceTags);
  const cautionTags = topTags(experiences, tagConfig.cautionExperienceTags || cautionExperienceTags);
  const riskSummary = getRiskSummaryText(experiences);
  const positiveText = positiveTags.length ? `被较多提到「${positiveTags.join("」「")}」` : "目前可参考的信息还不多";
  const cautionText = cautionTags.length ? `，同时也有体验提到「${cautionTags.join("」「")}」` : "";

  return `基于 ${experiences.length} 条体验，这家公司${positiveText}${cautionText}。当前${riskSummary}，建议把它作为投递前参考，并确认薪资、职责、流程和试用期安排。`;
};

const uniqueList = (items) => [...new Set(items)].filter(Boolean);

export const getFocusItems = (experiences) => {
  const items = uniqueList(
    experiences.flatMap((experience) => (experience.tags || []).map((tag) => tagRules[tag]?.observe)),
  );
  return items.length ? items.slice(0, 4) : [defaultReminder];
};

export const getActionItems = (experiences) => {
  const tagItems = experiences.flatMap((experience) => (experience.tags || []).map((tag) => tagRules[tag]?.action));
  const reminderItems = experiences.map((experience) => experience.reminder);
  const items = uniqueList([...tagItems, ...reminderItems]);
  return items.length ? items.slice(0, 4) : [defaultReminder];
};

export const enhanceCompany = (company, tagConfig = {}) => {
  const experiences = company.experiences || [];
  const configuredTags = [
    ...(tagConfig.positiveExperienceTags || positiveExperienceTags),
    ...(tagConfig.cautionExperienceTags || cautionExperienceTags),
  ];
  const tags = topTags(experiences, configuredTags);
  const allTags = uniqueList(experiences.flatMap((experience) => experience.tags || []));
  const riskSummaryText = getRiskSummaryText(experiences);

  return {
    ...company,
    experiences,
    tags,
    allTags,
    experienceCount: experiences.length,
    riskSummaryText,
    riskDistribution: getRiskDistribution(experiences),
    overallImpression: getOverallImpression({ ...company, experiences }, tagConfig),
    highlights: getFocusItems(experiences),
    watchouts: getActionItems(experiences),
  };
};

export const buildCompaniesWithLocalExperiences = (baseCompanies, localExperiences, tagConfig = {}) => {
  const companyMap = new Map();

  baseCompanies.forEach((company, index) => {
    companyMap.set(getCompanyMergeKey(company.name, company.city || "其他"), {
      ...company,
      sortIndex: index,
      experiences: [...(company.experiences || [])],
    });
  });

  localExperiences.forEach((experience, index) => {
    const city = normalizeCityName(experience.city || "其他");
    const mergeKey = getCompanyMergeKey(experience.companyName, city);
    const localExperience = {
      id: experience.id,
      city,
      stage: experience.stage,
      roleName: experience.roleName,
      riskLevel: experience.riskLevel || "不确定",
      tags: experience.tags || [],
      content: experience.content,
      reminder: experience.reminder,
      publishedAt: experience.publishedAt,
      isLocal: true,
    };

    if (companyMap.has(mergeKey)) {
      const existingCompany = companyMap.get(mergeKey);
      companyMap.set(mergeKey, {
        ...existingCompany,
        category: existingCompany.category || experience.category,
        localUpdatedAt: experience.publishedAt,
        sortIndex: -1000 - index,
        experiences: [localExperience, ...existingCompany.experiences],
      });
      return;
    }

    companyMap.set(mergeKey, {
      id: `local-company-${experience.id}`,
      name: experience.companyName,
      category: experience.category,
      city,
      stage: "待补充",
      summary: experience.content,
      sortIndex: -1000 - index,
      localUpdatedAt: experience.publishedAt,
      experiences: [localExperience],
      isLocal: true,
    });
  });

  return [...companyMap.values()]
    .map((company) => enhanceCompany(company, tagConfig))
    .sort((first, second) => first.sortIndex - second.sortIndex);
};
