# monorepo-vue-cli

> This cli support for command line operation projects. By specifying the project, you can ``create``, ``debug``, and ``update`` the project to achieve the collaborative management of multiple projects in a single repository.

English | [简体中文](./README-zh.md)

---

### Directory Structure
```bash
├── bin                           # cli code
├── lib                           # cli lib code
├── template                      # template code
│   ├── src                       # main project code
│   ├── project1                  # project1 code
│   ├── project2                  # project2 code
```

### First use

```
pnpm install
npm link
```

### No longer use

```
npm unlink -g monorepo-vue-cli
```

### Create project

```
mvc create <app-name>
eg: mvc create app
```
Options:

  -p, --project <project>       			   Select project (project1|project2) project1 | project2

### Debug project

```
mvc run <script>
eg: mvc run serve
```
Options:

  -p, --project <project>       			   Select project (project1|project2) project1 | project2

### Upgrade project

```
cd <app-name>
mvc upgrade
eg: mvc upgrade
```
Options:

  -p, --project <project>       			   Select project (project1|project2) project1 | project2

