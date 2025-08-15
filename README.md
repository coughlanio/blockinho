<div align="center">
  <img src="src/logo.svg" alt="Blockinho Logo" width="120" height="120">
</div>

# Blockinho

A simple web interface for managing [Blocky](https://0xerr0r.github.io/blocky/latest/) domain blocklists. Add domains, subdomains, wildcards, or regex patterns to allow/deny lists. It also supports disabling/enabling blocking, and pausing for 5m/30m. The allow/deny lists managed by Blockinho can then be added to Blocky as you would add any other local list.

### -inho

**suffix** _/ĩɲu/_

**Etymology**: From Latin _-īnus_ + diminutive _-ulus_\
**Function**: Forms diminutives in Portuguese
Definitions

1. Used to form nouns indicating small size or youth\
   _gato_ → gatinho (kitten)\
   _casa_ → casinha (small house)

2. Used to express affection or endearment\
   _filho_ → _filhinho_ (dear son)\
   _amor_ → _amorzinho_ (sweetheart)

3. Used to form adjectives expressing slight degree\
   _pequeno_ → _pequeninho_ (very small)\
   _novo_ → _novinho_ (brand new)

## Installation

```bash
docker build -t blockinho .
docker run -p 3000:3000 blockinho
```

To persist blocklist files, mount the config directory:

```bash
docker run -p 3000:3000 -v ./config:/config blockinho
```

### Docker Compose

```bash
docker-compose up -d
```

```yaml
version: "3.8"

services:
  blockinho:
    build: .
    ports:
      - "3000:3000"
    environment:
      - CONFIG_DIR=/config
      - BLOCKY_URL=http://blocky:4000
    volumes:
      - ./config:/config
    restart: unless-stopped
    container_name: blockinho
```

## Configuration

Blocklist files are stored in the directory specified by the `CONFIG_DIR` environment variable:

- **Development**: Current directory (default)
- **Docker**: `/config` (default)
- **Custom**: Set `CONFIG_DIR=/your/path`

Files created:

- `blockinho-allow.txt` - Allowed domains/patterns
- `blockinho-deny.txt` - Denied domains/patterns

Built with [Bun](https://bun.com) and React.
