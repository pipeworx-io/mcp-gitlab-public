interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * GitLab Public MCP — wraps the GitLab REST API v4 (public endpoints, no auth)
 *
 * Tools:
 * - search_projects: search public GitLab projects, ordered by star count
 * - get_project: get a public project by numeric ID or URL-encoded path
 * - search_issues: search issues across all public projects
 */


const BASE = 'https://gitlab.com/api/v4';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_projects',
    description:
      'Search public GitLab projects by keyword, ordered by star count. Returns project ID, name, description, stars, forks, open issues count, and web URL.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query string',
        },
        limit: {
          type: 'number',
          description: 'Number of results to return (default 10, max 100)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_project',
    description:
      'Get a public GitLab project by numeric ID or URL-encoded path (e.g., "gitlab-org%2Fgitlab"). Returns full project details including name, description, stars, forks, default branch, topics, and activity dates.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Project numeric ID or URL-encoded path (e.g., "gitlab-org%2Fgitlab")',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'search_issues',
    description:
      'Search issues across all public GitLab projects. Returns issue title, state, author, labels, project ID, and URL.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for issue titles and descriptions',
        },
        limit: {
          type: 'number',
          description: 'Number of results to return (default 10, max 100)',
        },
      },
      required: ['query'],
    },
  },
];

async function gitlabGet(path: string, params?: Record<string, string>): Promise<unknown> {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  const res = await fetch(`${BASE}${path}${qs}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Not found: ${path}`);
    if (res.status === 401 || res.status === 403)
      throw new Error(`Project is private or requires authentication.`);
    throw new Error(`GitLab API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function searchProjects(query: string, limit: number) {
  const perPage = Math.min(100, Math.max(1, limit));
  const data = (await gitlabGet('/projects', {
    search: query,
    per_page: String(perPage),
    order_by: 'stars_count',
    sort: 'desc',
  })) as {
    id: number;
    name: string;
    path_with_namespace: string;
    description: string | null;
    star_count: number;
    forks_count: number;
    open_issues_count: number;
    web_url: string;
    default_branch: string;
    visibility: string;
    last_activity_at: string;
  }[];

  return {
    projects: data.map((p) => ({
      id: p.id,
      name: p.name,
      full_path: p.path_with_namespace,
      description: p.description ?? null,
      stars: p.star_count,
      forks: p.forks_count,
      open_issues: p.open_issues_count,
      url: p.web_url,
      default_branch: p.default_branch,
      visibility: p.visibility,
      last_activity: p.last_activity_at,
    })),
  };
}

async function getProject(id: string) {
  const data = (await gitlabGet(`/projects/${encodeURIComponent(id)}`)) as {
    id: number;
    name: string;
    path_with_namespace: string;
    description: string | null;
    web_url: string;
    star_count: number;
    forks_count: number;
    open_issues_count: number;
    default_branch: string;
    visibility: string;
    archived: boolean;
    topics: string[];
    namespace: { full_path: string };
    created_at: string;
    last_activity_at: string;
  };

  return {
    id: data.id,
    name: data.name,
    full_path: data.path_with_namespace,
    description: data.description ?? null,
    url: data.web_url,
    stars: data.star_count,
    forks: data.forks_count,
    open_issues: data.open_issues_count,
    default_branch: data.default_branch,
    visibility: data.visibility,
    archived: data.archived,
    topics: data.topics ?? [],
    namespace: data.namespace?.full_path ?? null,
    created_at: data.created_at,
    last_activity: data.last_activity_at,
  };
}

async function searchIssues(query: string, limit: number) {
  const perPage = Math.min(100, Math.max(1, limit));
  const data = (await gitlabGet('/issues', {
    search: query,
    scope: 'all',
    per_page: String(perPage),
    order_by: 'updated_at',
    sort: 'desc',
  })) as {
    iid: number;
    id: number;
    title: string;
    state: string;
    labels: string[];
    author: { username: string } | null;
    assignee: { username: string } | null;
    project_id: number;
    web_url: string;
    created_at: string;
    updated_at: string;
  }[];

  return {
    issues: data.map((i) => ({
      id: i.id,
      iid: i.iid,
      title: i.title,
      state: i.state,
      labels: i.labels,
      author: i.author?.username ?? null,
      assignee: i.assignee?.username ?? null,
      project_id: i.project_id,
      url: i.web_url,
      created_at: i.created_at,
      updated_at: i.updated_at,
    })),
  };
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_projects':
      return searchProjects(args.query as string, (args.limit as number) ?? 10);
    case 'get_project':
      return getProject(args.id as string);
    case 'search_issues':
      return searchIssues(args.query as string, (args.limit as number) ?? 10);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool } satisfies McpToolExport;
