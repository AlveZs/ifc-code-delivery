# Code Delivery - Kafka

## Descrição

Repositório do Apache Kafka (Backend)

### Problemas conhecidos (Linux)

* Permissão

```
sudo chown -R 1000:1000 <destination>
```

* Memória
```
sudo sysctl -w vm.max_map_count=262144
```

## Elastic index

```
PUT route.new-position
{
  "mappings": {
    "properties": {
      "clientId": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "routeId": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "timestamp": {
        "type": "date"
      },
      "finished": {
        "type": "boolean"
      },
      "position": {
        "type": "geo_point"
      }
    }
  }
}

PUT route.new-direction
{
  "mappings": {
    "properties": {
      "clientId": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "routeId": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "timestamp": {
        "type": "date"
      }
    }
  }
}
```