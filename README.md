```
 _   _                         _____                     _               _   __  __  _____ _____
| \ | |                       / ____|                   | |             | | |  \/  |/ ____|  __ \
|  \| | __ ___   _____ _ __  | (___   ___  __ _ _ __ ___| |__   __ _  __| | | \  / | |    | |__) |
| . ` |/ _` \ \ / / _ \ '__|  \___ \ / _ \/ _` | '__/ __| '_ \ / _` |/ _` | | |\/| | |    |  ___/
| |\  | (_| |\ V /  __/ |     ____) |  __/ (_| | | | (__| | | | (_| | (_| | | |  | | |____| |
|_| \_|\__,_| \_/ \___|_|    |_____/ \___|\__,_|_|  \___|_| |_|\__,_|\__,_| |_|  |_|\_____|_|
```

# @packative/naver-searchad-mcp

An MCP (Model Context Protocol) server for the Naver SearchAd API. Manage campaigns, ad groups, ads, keywords, and retrieve performance statistics directly from Claude Desktop or any MCP-compatible client.

## Credits

This project is a fork of [ND-SPACE/naver-searchad-mcp](https://github.com/ND-SPACE/naver-searchad-mcp), extended with additional features and improvements by [Packative](https://packative.com).

### This fork

`riskatcher/naver-searchad-mcp` tracks [packative/naver-searchad-mcp](https://github.com/packative/naver-searchad-mcp) and adds one thing: response-size control on `get_keyword_suggestions`.

Naver's `/keywordstool` returns up to 1000 related keywords per call — around 320 KB for two seed keywords. Behind an MCP gateway that overruns the client's response budget, and in a web chat there is no file to spill it into. So the tool gained `limit` and `sortBy` arguments plus a `NAVER_KEYWORD_DEFAULT_LIMIT` default, and its response now reports `totalCount` / `returnedCount` / `truncated` so the caller can tell it received a slice. Nothing else diverges from upstream.

## Features

- **47 Tools** covering the full Naver SearchAd API
- **Campaign Management**: List, get, create, update, and delete campaigns
- **Ad Group Management**: Full CRUD for ad groups
- **Ad/Creative Management**: List, get, create, update, and delete ads
- **Keyword Management**: Full CRUD for keywords
- **Negative Keywords**: Manage negative keywords at campaign or ad group level
- **Ad Extensions**: Manage sitelinks, callouts, and other ad extensions
- **Keyword Tool**: Get keyword suggestions, search volume, and bid estimates
- **Performance Statistics**: Detailed stats with flexible date ranges, breakdowns, and async reports
- **Bizmoney/Budget**: Check account balance, transaction history, and cost breakdowns
- **Labels**: Organize campaigns, ad groups, and other entities
- **Business Channels**: List and inspect business channels
- **Account & Quality**: Member info, keyword quality index, IP exclusions
- **Permission Modes**: `--ro`, `--rw`, `--rwd` flags to control access (read-only by default)
- **TypeScript**: Fully typed with modular architecture

## Installation

```bash
npm install -g @packative/naver-searchad-mcp
```

Or with pnpm:

```bash
pnpm add -g @packative/naver-searchad-mcp
```

## Configuration

### Environment Variables

The server requires the following environment variables:

| Variable | Description |
|----------|-------------|
| `NAVER_API_KEY` | Your Naver SearchAd API key |
| `NAVER_SIGN_KEY` | Your Naver SearchAd secret key for signing requests |
| `NAVER_CUSTOMER_ID` | Your Naver advertiser customer ID |

Optional:

| Variable | Description |
|----------|-------------|
| `NAVER_KEYWORD_DEFAULT_LIMIT` | Default row cap for `get_keyword_suggestions` when the caller sends no `limit`. Defaults to `50`; set `0` to return every row. |

### Permission Modes

The server supports three permission modes to protect against accidental destructive operations. **The default is read-only.**

| Flag | Mode | Tools | Description |
|------|------|-------|-------------|
| `--ro` | Read-only | 26 | List, get, stats, and download operations only (default) |
| `--rw` | Read-write | 39 | Adds create and update operations |
| `--rwd` | Read-write-delete | 47 | Full access including delete operations |

Pass the flag as a CLI argument:

```bash
# Read-only (default, safest)
naver-searchad-mcp

# Allow creating and updating
naver-searchad-mcp --rw

# Full access including deletes
naver-searchad-mcp --rwd
```

If a tool is called that isn't allowed by the current permission mode, the server returns a clear error message indicating which mode is required.

### Claude Desktop Setup

Add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "naver-searchad": {
      "command": "npx",
      "args": ["-y", "@packative/naver-searchad-mcp", "--rw"],
      "env": {
        "NAVER_API_KEY": "your-api-key",
        "NAVER_SIGN_KEY": "your-secret-key",
        "NAVER_CUSTOMER_ID": "your-customer-id"
      }
    }
  }
}
```

### Claude Code Setup

Add to your Claude Code settings:

```json
{
  "mcpServers": {
    "naver-searchad": {
      "command": "npx",
      "args": ["-y", "@packative/naver-searchad-mcp", "--rw"],
      "env": {
        "NAVER_API_KEY": "your-api-key",
        "NAVER_SIGN_KEY": "your-secret-key",
        "NAVER_CUSTOMER_ID": "your-customer-id"
      }
    }
  }
}
```

## Available Tools (47)

### Campaign Tools

| Tool | Permission | Description |
|------|-----------|-------------|
| `list_campaigns` | read | List all campaigns |
| `get_campaign` | read | Get details of a specific campaign |
| `create_campaign` | write | Create a new campaign |
| `update_campaign` | write | Update a campaign (name, budget, delivery method, pause/enable) |
| `delete_campaign` | delete | Delete a campaign |

### Ad Group Tools

| Tool | Permission | Description |
|------|-----------|-------------|
| `list_adgroups` | read | List ad groups, optionally filtered by campaign |
| `get_adgroup` | read | Get details of a specific ad group |
| `create_adgroup` | write | Create a new ad group in a campaign |
| `update_adgroup` | write | Update an ad group (bid, budget, pause/enable) |
| `delete_adgroup` | delete | Delete an ad group |

### Ad (Creative) Tools

| Tool | Permission | Description |
|------|-----------|-------------|
| `list_ads` | read | List all ads in an ad group |
| `get_ad` | read | Get details of a specific ad |
| `create_ad` | write | Create a new ad in an ad group |
| `update_ad` | write | Update an ad (creative content, pause/enable) |
| `delete_ad` | delete | Delete an ad |

### Keyword Tools

| Tool | Permission | Description |
|------|-----------|-------------|
| `list_keywords` | read | List all keywords in an ad group |
| `get_keyword` | read | Get details of a specific keyword |
| `create_keyword` | write | Add a keyword to an ad group |
| `update_keyword` | write | Update a keyword (bid amount, pause/enable) |
| `delete_keyword` | delete | Delete a keyword |

### Negative Keyword Tools

| Tool | Permission | Description |
|------|-----------|-------------|
| `list_negative_keywords` | read | List negative keywords for an ad group or campaign |
| `create_negative_keywords` | write | Add negative keywords (EXACT or PHRASE match) |
| `delete_negative_keywords` | delete | Delete negative keywords by IDs |

### Ad Extension Tools

| Tool | Permission | Description |
|------|-----------|-------------|
| `list_ad_extensions` | read | List ad extensions for an ad group |
| `create_ad_extension` | write | Create an ad extension (sitelink, callout, etc.) |
| `delete_ad_extension` | delete | Delete an ad extension |

### Statistics Tools

| Tool | Permission | Description |
|------|-----------|-------------|
| `get_stats` | read | Get performance stats (impressions, clicks, cost, conversions, etc.) |
| `get_campaign_stats` | read | Get stats for all active campaigns with campaign details |
| `create_stat_report` | write | Create an async stat report job |
| `get_stat_report` | read | Check status of an async report job |
| `download_stat_report` | read | Download a completed stat report |

**Available metrics:** `impCnt` (impressions), `clkCnt` (clicks), `salesAmt` (cost), `ctr` (CTR), `cpc` (CPC), `ccnt` (conversions), `crto` (conversion rate), `convAmt` (conversion value), `ror` (ROAS), `cpConv` (cost per conversion), `avgRnk` (avg rank)

**Date presets:** `today`, `yesterday`, `last7days`, `last30days`, `lastweek`, `lastmonth`, `lastquarter`

**Breakdowns:** `pcMblTp` (device), `dayw` (day of week), `hh24` (hour), `regnNo` (region)

### Keyword Research & Bid Estimate Tools

| Tool | Permission | Description |
|------|-----------|-------------|
| `get_keyword_suggestions` | read | Get keyword ideas with search volume, CTR, and competition data |

`get_keyword_suggestions` takes `hintKeywords` (up to 5 seeds) plus three optional
arguments:

| Argument | Default | Description |
|----------|---------|-------------|
| `showDetail` | `true` | Include the per-keyword volume, click, and CTR metrics |
| `limit` | `NAVER_KEYWORD_DEFAULT_LIMIT`, else `50` | Rows to return. `0` returns every row |
| `sortBy` | `total` | Order applied before the limit: `total` (PC + mobile monthly volume), `pc`, `mobile`, or `none` for Naver's own order |

The response wraps `keywordList` with `totalCount`, `returnedCount`, `truncated`,
and the `sortBy` that was applied, so a truncated result is never mistaken for
the whole set.
| `get_estimate_performance` | read | Estimate impressions, clicks, and cost at given bid amounts |
| `get_estimate_median_bid` | read | Get median bid to appear on first page |

### Bizmoney (Budget) Tools

| Tool | Permission | Description |
|------|-----------|-------------|
| `get_bizmoney` | read | Get current account balance |
| `get_bizmoney_histories` | read | Get transaction history (charges, refunds) |
| `get_bizmoney_cost` | read | Get cost breakdown by date |

### Business Channel Tools

| Tool | Permission | Description |
|------|-----------|-------------|
| `list_channels` | read | List all business channels |
| `get_channel` | read | Get details of a specific channel |

### Label Tools

| Tool | Permission | Description |
|------|-----------|-------------|
| `list_labels` | read | List all labels |
| `create_label` | write | Create a label (name + color) |
| `delete_label` | delete | Delete a label |

### Other Tools

| Tool | Permission | Description |
|------|-----------|-------------|
| `get_member_info` | read | Get account/member information |
| `get_quality_index` | read | Get keyword quality scores and improvement suggestions |
| `list_ip_exclusions` | read | List blocked IPs for click fraud prevention |
| `create_ip_exclusion` | write | Block an IP address |
| `delete_ip_exclusion` | delete | Unblock an IP address |

## Usage Examples

### List all campaigns
```
"Show me all my Naver SearchAd campaigns"
```

### Get campaign performance
```
"What's the performance of my Naver campaigns for the last 30 days?"
```

### Create a new campaign
```
"Create a new Naver SearchAd campaign called 'Summer Sale' with type WEB_SITE"
```

### Keyword research
```
"Find keyword suggestions for '패키지 디자인' with search volume data"
```

### Check account balance
```
"What's my current Naver SearchAd budget balance?"
```

### Get keyword statistics
```
"Show me the click-through rate for my keywords in the last week"
```

## Getting API Credentials

1. Log in to [Naver SearchAd](https://searchad.naver.com/)
2. Go to Tools > API Management
3. Create a new API key
4. Note your API Key, Secret Key, and Customer ID

For detailed API documentation, see the [Official Naver SearchAd API Documentation](https://naver.github.io/searchad-apidoc/#/guides).

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Type check
pnpm typecheck

# Build
pnpm build
```

### Project Structure

```
src/
  index.ts                  # Server setup, permission mode, tool registration
  types/
    common.ts               # Shared types (ToolDefinition, AccessLevel, PermissionMode)
    campaigns.ts            # Campaign types
    adgroups.ts             # Ad group types
    keywords.ts             # Keyword types
    ads.ts                  # Ad/creative types
    stats.ts                # Stats & report types
    channels.ts             # Channel types
    bizmoney.ts             # Bizmoney types
    keyword-tool.ts         # Keyword suggestion & estimate types
    ad-extensions.ts        # Ad extension types
    negative-keywords.ts    # Negative keyword types
    labels.ts               # Label types
    misc.ts                 # Member, quality index, IP exclusion types
  tools/
    campaigns.ts            # Campaign tool definitions & handlers
    adgroups.ts             # Ad group tools
    keywords.ts             # Keyword tools
    ads.ts                  # Ad/creative tools
    stats.ts                # Stats & report tools
    channels.ts             # Channel tools
    bizmoney.ts             # Bizmoney tools
    keyword-tool.ts         # Keyword research & bid estimate tools
    ad-extensions.ts        # Ad extension tools
    negative-keywords.ts    # Negative keyword tools
    labels.ts               # Label tools
    misc.ts                 # Member, quality index, IP exclusion tools
  utils/
    fetchWithAuth.ts        # Authenticated HTTP client (HMAC-SHA256)
```

## Requirements

- Node.js 18 or higher
- Naver SearchAd API credentials

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

We use [Conventional Commits](https://www.conventionalcommits.org/) for automatic versioning and changelog generation.

- **`development`** branch for ongoing work
- **`master`** branch is protected - merging triggers automatic releases

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

Issues and pull requests are welcome on [GitHub](https://github.com/packative/naver-searchad-mcp).

---

### About Packative

[Packative](https://packative.com) is a Korean packaging e-commerce platform that helps businesses find and order custom packaging solutions. We build tools to streamline our marketing operations and share them with the community.

This MCP server is part of our marketing automation toolkit, enabling AI-assisted management of Naver SearchAd campaigns.
