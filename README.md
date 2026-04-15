# mcp-gitlab-public

GitLab Public MCP — wraps the GitLab REST API v4 (public endpoints, no auth)

Part of the [Pipeworx](https://pipeworx.io) open MCP gateway.

## Tools

| Tool | Description |
|------|-------------|

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "gitlab-public": {
      "url": "https://gateway.pipeworx.io/gitlab-public/mcp"
    }
  }
}
```

Or use the CLI:

```bash
npx pipeworx use gitlab-public
```

## License

MIT
