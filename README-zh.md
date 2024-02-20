# monorepo-vue-cli

> 此脚手架提供支持命令行操作项目，通过指定项目，进行项目的``创建``、``调试``、``更新``，以达到单仓库多项目协同管理的作用。

---

### 目录结构
```bash
├── bin                           # 脚手架源代码
├── lib                           # 脚手架源代码库
├── template                      # 模板源代码
│   ├── src                       # 主项目源代码
│   ├── project1                  # 项目1源代码
│   ├── project2                  # 项目2源代码
```

### 第一次使用

```
pnpm install
npm link
```

### 不再使用

```
npm unlink -g monorepo-vue-cli
```

### 创建项目

```
mvc create <app-name>
eg: mvc create app
```
Options:

  -p, --project <project>       			   选择项目 (project1|project2) project1 | project2

### 调试项目

```
mvc run <script>
eg: mvc run serve
```
Options:

  -p, --project <project>       			   选择项目 (project1|project2) project1 | project2

### 更新项目

```
cd <app-name>
mvc upgrade
eg: mvc upgrade
```
Options:

  -p, --project <project>       			   选择项目 (project1|project2) project1 | project2
