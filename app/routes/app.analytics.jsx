import { data, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  // Fetch all blogs and their articles with likes_count metafield
  const response = await admin.graphql(`
    query {
      blogs(first: 20) {
        nodes {
          title
          articles(first: 100) {
            nodes {
              id
              title
              metafield(namespace: "custom", key: "likes_count") {
                value
              }
            }
          }
        }
      }
    }
  `);

  const result = await response.json();

  const articles = [];

  // Flatten all articles
  result?.data?.blogs?.nodes?.forEach((blog) => {
    blog?.articles?.nodes?.forEach((article) => {
      articles.push({
        title: article.title,
        likes: parseInt(article?.metafield?.value || "0", 10),
      });
    });
  });

  // Sort by likes descending
  articles.sort((a, b) => b.likes - a.likes);

  // Dynamic totals
  const totalBlogs = articles.length;
  const totalLikes = articles.reduce(
    (sum, article) => sum + article.likes,
    0
  );

  return data({
    totalBlogs,
    totalLikes,
    articles,
  });
}

export default function AnalyticsPage() {
  const { totalBlogs, totalLikes, articles } = useLoaderData();

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "24px" }}>
        Blog Analytics
      </h1>

      {/* Summary Card */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid rgb(81, 149, 83)",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Summary</h2>
        <p>
          <strong>Total Blog Posts:</strong> {totalBlogs}
        </p>
        <p>
          <strong>Total Likes:</strong> {totalLikes}
        </p>
      </div>

      {/* Blog Table */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e1e3e5",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Blog Like Counts</h2>

        {articles.length > 0 ? (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "16px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px",
                    borderBottom: "1px solid #e1e3e5",
                  }}
                >
                  #
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px",
                    borderBottom: "1px solid #e1e3e5",
                  }}
                >
                  Blog Title
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px",
                    borderBottom: "1px solid #e1e3e5",
                  }}
                >
                  Likes
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article, index) => (
                <tr key={index}>
                  <td
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #f1f2f3",
                    }}
                  >
                    {index + 1}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #f1f2f3",
                    }}
                  >
                    {article.title}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #f1f2f3",
                    }}
                  >
                    ❤️ {article.likes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No blog articles found.</p>
        )}
      </div>
    </div>
  );
}