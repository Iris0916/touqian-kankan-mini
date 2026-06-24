import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import PageShell from "./components/PageShell.jsx";
import HomePage from "./pages/HomePage.jsx";
import CompanyListPage from "./pages/CompanyListPage.jsx";
import CompanyDetailPage from "./pages/CompanyDetailPage.jsx";
import SubmitExperiencePage from "./pages/SubmitExperiencePage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import { buildCompaniesWithLocalExperiences, normalizeCityName, normalizeCompanyName } from "./utils/companyInsights.js";
import { clearContentConfig, readContentConfig, saveContentConfig } from "./utils/contentConfig.js";
import { clearLocalExperiences, readLocalExperiences } from "./utils/localExperiences.js";

const routeFromLocation = () => {
  const hashRoute = window.location.hash.replace("#", "");
  if (hashRoute) return hashRoute;
  return window.location.pathname === "/" ? "/" : window.location.pathname;
};

function App() {
  const [route, setRoute] = useState(routeFromLocation());
  const [contentConfig, setContentConfig] = useState(() => readContentConfig());

  useEffect(() => {
    // 业务逻辑：原型只需要本地页面切换，用 hash 路由避免额外引入路由库。
    const handleHashChange = () => setRoute(routeFromLocation());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    // 业务逻辑：兼容旧版本，把单独存放的本地体验迁移到统一的公司数据里。
    const oldLocalExperiences = readLocalExperiences();
    if (!oldLocalExperiences.length) return;

    const migratedConfig = oldLocalExperiences.reduce(
      (currentConfig, experience) => addExperienceToConfig(currentConfig, experience),
      readContentConfig(),
    );
    setContentConfig(saveContentConfig(migratedConfig));
    clearLocalExperiences();
  }, []);

  const allCompanies = useMemo(
    () =>
      buildCompaniesWithLocalExperiences(contentConfig.companies, [], {
        positiveExperienceTags: contentConfig.positiveExperienceTags,
        cautionExperienceTags: contentConfig.cautionExperienceTags,
      }),
    [contentConfig],
  );

  const selectedCompany = useMemo(() => {
    const match = route.match(/^\/companies\/(.+)$/);
    if (!match) return null;
    return allCompanies.find((company) => company.id === match[1]);
  }, [allCompanies, route]);

  const goTo = (nextRoute) => {
    window.location.hash = nextRoute;
  };

  const handleExperienceSaved = (experience) => {
    setContentConfig((currentConfig) => saveContentConfig(addExperienceToConfig(currentConfig, experience)));
  };

  const handleConfigSaved = (nextConfig) => {
    setContentConfig(saveContentConfig(nextConfig));
  };

  const handleConfigReset = () => {
    const defaultConfig = clearContentConfig();
    setContentConfig(defaultConfig);
    clearLocalExperiences();
    return defaultConfig;
  };

  const handleExperienceDeleted = (companyId, experienceId) => {
    setContentConfig((currentConfig) => {
      const nextConfig = removeExperienceFromConfig(currentConfig, companyId, experienceId);
      const companyStillExists = nextConfig.companies.some((company) => company.id === companyId);
      if (!companyStillExists && route.startsWith("/companies/")) {
        goTo("/companies");
      }
      return saveContentConfig(nextConfig);
    });
  };

  let page = <HomePage goTo={goTo} homeContent={contentConfig.homeContent} />;

  if (route === "/companies") {
    page = <CompanyListPage companies={allCompanies} categories={contentConfig.categories} goTo={goTo} />;
  }

  if (route.startsWith("/companies/")) {
    page = <CompanyDetailPage company={selectedCompany} goTo={goTo} onExperienceDeleted={handleExperienceDeleted} />;
  }

  if (route === "/submit") {
    page = (
      <SubmitExperiencePage
        companies={allCompanies}
        categories={contentConfig.categories}
        positiveExperienceTags={contentConfig.positiveExperienceTags}
        cautionExperienceTags={contentConfig.cautionExperienceTags}
        goTo={goTo}
        onExperienceSaved={handleExperienceSaved}
      />
    );
  }

  if (route === "/admin") {
    page = (
      <AdminPage
        config={contentConfig}
        onConfigSaved={handleConfigSaved}
        onConfigReset={handleConfigReset}
        onExperienceDeleted={handleExperienceDeleted}
      />
    );
  }

  return (
    <PageShell>
      <Header currentRoute={route} goTo={goTo} />
      {page}
    </PageShell>
  );
}

const createExperienceId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `user-${Date.now()}`;
};

const addExperienceToConfig = (config, experience) => {
  const city = normalizeCityName(experience.city || "其他");
  const companyName = experience.companyName.trim();
  const nextExperience = {
    id: experience.id || createExperienceId(),
    source: experience.source || "user",
    stage: experience.stage,
    roleName: experience.roleName,
    riskLevel: experience.riskLevel || "不确定",
    tags: experience.tags || [],
    content: experience.content,
    reminder: experience.reminder || "",
    publishedAt: experience.publishedAt || new Date().toISOString().slice(0, 10),
  };

  let didMerge = false;
  const companies = config.companies.map((company) => {
    const sameName = normalizeCompanyName(company.name) === normalizeCompanyName(companyName);
    const sameCity = normalizeCityName(company.city || "其他") === city;
    if (!sameName || !sameCity) return company;

    didMerge = true;
    return {
      ...company,
      experiences: [nextExperience, ...(company.experiences || [])],
    };
  });

  if (didMerge) {
    return {
      ...config,
      companies,
    };
  }

  return {
    ...config,
    companies: [
      {
        id: `local-company-${nextExperience.id}`,
        name: companyName,
        city,
        category: experience.category,
        stage: "待补充",
        summary: experience.content,
        experiences: [nextExperience],
      },
      ...companies,
    ],
  };
};

const removeExperienceFromConfig = (config, companyId, experienceId) => ({
  ...config,
  companies: config.companies
    .map((company) => {
      if (company.id !== companyId) return company;
      return {
        ...company,
        experiences: (company.experiences || []).filter((experience) => experience.id !== experienceId),
      };
    })
    .filter((company) => (company.experiences || []).length > 0),
});

export default App;
