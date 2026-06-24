import { useMemo, useState } from "react";
import CompanyCard from "../components/CompanyCard.jsx";
import FilterBar from "../components/FilterBar.jsx";
import { cityFilterOptions } from "../data/companies.js";

function CompanyListPage({ companies, categories, goTo }) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("全部");
  const [city, setCity] = useState("全部城市");
  const [experienceTag, setExperienceTag] = useState("全部");

  const filteredCompanies = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return companies.filter((company) => {
      // 业务逻辑：列表页只做前端本地筛选，不请求后端数据。
      const matchCategory = category === "全部" || company.category === category;
      const matchCity =
        city === "全部城市" ||
        company.city === city ||
        (city === "其他" && !cityFilterOptions.includes(company.city));
      const matchExperienceTag = experienceTag === "全部" || company.allTags.includes(experienceTag);
      const searchableText = [
        company.name,
        company.city,
        company.category,
        company.stage,
        company.summary,
        company.overallImpression,
        ...company.allTags,
        ...company.experiences.flatMap((experience) => [
          experience.stage,
          experience.roleName,
          experience.content,
          experience.reminder,
          ...(experience.tags || []),
        ]),
      ]
        .join(" ")
        .toLowerCase();
      const matchKeyword = !normalizedKeyword || searchableText.includes(normalizedKeyword);

      return matchCategory && matchCity && matchExperienceTag && matchKeyword;
    });
  }, [companies, keyword, category, city, experienceTag]);

  return (
    <main className="content-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Company Notes</span>
          <h1>公司体验列表</h1>
          <p>先用关键词和类型筛一遍，再进入详情页看更具体的体验线索。</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => goTo("/submit")}>
          写一条体验
        </button>
      </div>

      <FilterBar
        keyword={keyword}
        category={category}
        city={city}
        experienceTag={experienceTag}
        categories={categories}
        cityOptions={cityFilterOptions}
        experienceTags={[...new Set(companies.flatMap((company) => company.allTags || []))]}
        onKeywordChange={setKeyword}
        onCategoryChange={setCategory}
        onCityChange={setCity}
        onExperienceTagChange={setExperienceTag}
      />

      <section className="result-summary" aria-live="polite">
        找到 {filteredCompanies.length} 家符合条件的公司
      </section>

      {filteredCompanies.length > 0 ? (
        <section className="company-grid">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onViewDetail={(companyId) => goTo(`/companies/${companyId}`)}
            />
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <h2>暂时没有找到相关体验</h2>
          <p>你可以换个关键词，或者写下你的第一条体验。</p>
          <button className="primary-button empty-action" type="button" onClick={() => goTo("/submit")}>
            写一条体验
          </button>
        </section>
      )}
    </main>
  );
}

export default CompanyListPage;
