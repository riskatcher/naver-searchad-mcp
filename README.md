```
 _   _                         _____                     _               _   __  __  _____ _____
| \ | |                       / ____|                   | |             | | |  \/  |/ ____|  __ \
|  \| | __ ___   _____ _ __  | (___   ___  __ _ _ __ ___| |__   __ _  __| | | \  / | |    | |__) |
| . ` |/ _` \ \ / / _ \ '__|  \___ \ / _ \/ _` | '__/ __| '_ \ / _` |/ _` | | |\/| | |    |  ___/
| |\  | (_| |\ V /  __/ |     ____) |  __/ (_| | | | (__| | | | (_| | (_| | | |  | | |____| |
|_| \_|\__,_| \_/ \___|_|    |_____/ \___|\__,_|_|  \___|_| |_|\__,_|\__,_| |_|  |_|\_____|_|
```

# @packative/naver-searchad-mcp

An MCP (Model Context Protocol) server for the Naver SearchAd API. Manage campaigns, ad groups, keywords, and retrieve performance statistics directly from Claude Desktop or any MCP-compatible client.

## Credits

This project is a fork of [ND-SPACE/naver-searchad-mcp](https://github.com/ND-SPACE/naver-searchad-mcp), extended with additional features and improvements by [Packative](https://packative.com).

## Features

- **Campaign Management**: List, create, and delete campaigns
- **Ad Group Management**: List, get details, and create ad groups
- **Keyword Management**: List and add keywords to ad groups
- **Performance Statistics**: Retrieve detailed stats with flexible date ranges and breakdowns
- **Active Campaign Filtering**: Automatically filters to show only active (ELIGIBLE) campaigns
- **TypeScript**: Fully typed for better developer experience

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

### Claude Desktop Setup

Add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "naver-searchad": {
      "command": "npx",
      "args": ["-y", "@packative/naver-searchad-mcp"],
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
      "args": ["-y", "@packative/naver-searchad-mcp"],
      "env": {
        "NAVER_API_KEY": "your-api-key",
        "NAVER_SIGN_KEY": "your-secret-key",
        "NAVER_CUSTOMER_ID": "your-customer-id"
      }
    }
  }
}
```

## Available Tools

### Campaign Tools

#### `list_campaigns`
List all Naver SearchAd campaigns.

#### `create_campaign`
Create a new campaign.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Campaign name |
| `campaignTp` | string | Yes | Campaign type (e.g., `WEB_SITE`, `SHOPPING`) |
| `customerId` | string | No | Customer ID |
| `dailyBudget` | number | No | Daily budget in KRW |
| `deliveryMethod` | string | No | `STANDARD` or `ACCELERATED` |

#### `delete_campaign`
Delete a campaign.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaignId` | string | Yes | Campaign ID to delete |

### Ad Group Tools

#### `list_adgroups`
List all ad groups, optionally filtered by campaign.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaignId` | string | No | Filter by campaign ID |

#### `get_adgroup`
Get details of a specific ad group.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `adgroupId` | string | Yes | Ad group ID |

#### `create_adgroup`
Create a new ad group.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nccCampaignId` | string | Yes | Parent campaign ID |
| `name` | string | Yes | Ad group name |
| `pcChannelId` | string | No | PC channel ID |
| `mobileChannelId` | string | No | Mobile channel ID |
| `bidAmt` | number | No | Bid amount in KRW |

### Keyword Tools

#### `list_keywords`
List all keywords in an ad group.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `adgroupId` | string | Yes | Ad group ID |

#### `create_keyword`
Add a keyword to an ad group.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `adgroupId` | string | Yes | Ad group ID |
| `keyword` | string | Yes | Keyword text |
| `bidAmt` | number | No | Bid amount in KRW |

### Statistics Tools

#### `get_stats`
Get performance statistics for campaigns, ad groups, or keywords.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | No | Single ID to query |
| `ids` | array | No | Multiple IDs to query |
| `fields` | array | No | Metrics to retrieve (default: `impCnt`, `clkCnt`, `salesAmt`, `ctr`, `cpc`, `ccnt`) |
| `datePreset` | string | No | `today`, `yesterday`, `last7days`, `last30days`, `lastweek`, `lastmonth`, `lastquarter` |
| `timeRange` | object | No | Custom date range with `since` and `until` (YYYY-MM-DD) |
| `timeIncrement` | string | No | `1` (daily) or `allDays` (summary) |
| `breakdown` | string | No | `pcMblTp` (device), `dayw` (day of week), `hh24` (hour), `regnNo` (region) |

**Available metrics:**
- `impCnt` - Impressions
- `clkCnt` - Clicks
- `salesAmt` - Cost/Spend
- `ctr` - Click-through rate
- `cpc` - Cost per click
- `ccnt` - Conversions
- `crto` - Conversion rate
- `convAmt` - Conversion value
- `ror` - Return on ad spend
- `cpConv` - Cost per conversion
- `avgRnk` - Average rank

#### `get_campaign_stats`
Get performance statistics for all active campaigns.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Start date (YYYY-MM-DD) |
| `endDate` | string | No | End date (YYYY-MM-DD) |
| `datePreset` | string | No | Use preset instead of custom dates |

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

## Requirements

- Node.js 18 or higher
- Naver SearchAd API credentials

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/packative/naver-searchad-mcp).

---

### About Packative

[Packative](https://packative.com) is a Korean packaging e-commerce platform that helps businesses find and order custom packaging solutions. We build tools to streamline our marketing operations and share them with the community.

This MCP server is part of our marketing automation toolkit, enabling AI-assisted management of Naver SearchAd campaigns.
