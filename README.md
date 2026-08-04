# mcp-gitlab-public

GitLab Public MCP — wraps the GitLab REST API v4 (public endpoints, no auth)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_projects` | Search public GitLab projects by keyword, sorted by popularity. Returns project ID, name, description, star count, fork count, open issues, and web URL. |
| `get_project` | Get full details for a public GitLab project by ID or path (e.g., "gitlab-org%2Fgitlab"). Returns name, description, stars, forks, default branch, topics, and last activity date. |
| `search_issues` | Search issues across public GitLab projects by keyword. Returns issue title, state, author, labels, project ID, and direct URL. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "gitlab-public": {
      "url": "https://gateway.pipeworx.io/gitlab-public/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Gitlab Public data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
