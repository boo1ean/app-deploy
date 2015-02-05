## app-deploy

Deploy helpers. Part of app-helpers project

## Triggers config

```js
// config.json
{
	"triggers": {
		"bower.json": "bower intall",
		"package.json": "npm intall",
		"core/**": "pm2 restart processes.json",
		"frontend/**": "gulp build",
	}
}
```

## License
MIT
