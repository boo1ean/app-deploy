## app-deploy

Determine files diff from last deploy and execute only specific commands to setup updates.

## Triggers config

Specify glob patterns for detecting changes and appropriate commands to execute if changes occur

```js
// config.json
{
	"triggers": {
		"bower.json"   : "bower intall",
		"package.json" : "npm intall",
		"core/**"      : "pm2 restart processes.json",
		"frontend/**"  : "gulp build",
		"database/**"  : "knex migrate:latest"
	}
}
```

Usage:

```
app-deploy config.json
```

## License
MIT
