# orangeHRM-ts
1. test.describe('PIM Module - Personnel Information Management')
复杂度：高（核心业务，包含大量表单、文件处理和数据搜索）
•	Case 1: 创建员工 (Happy Path) - 填写必填项，上传头像（setInputFiles），验证保存成功。
•	Case 2: 员工列表多重搜索 - 同时根据“员工姓名”、“员工ID”和“雇佣状态”进行筛选。
•	Case 3: 批量删除员工 - 选中多个 Checkbox，处理确认弹窗，断言列表更新。
•	Case 4: 数据驱动创建 (Data Driven) - 使用 for...of 循环，根据数组中的多组数据批量创建不同职位的员工。
•	Case 5: 附件管理 - 在员工详情页上传 PDF 附件，并验证下载链接是否有效。
2. test.describe('Leave Module - Leave Management')
复杂度：中高（涉及日期控件、状态机转换）
•	Case 1: 提交请假申请 - 练习日期选择器（Date Picker），选择跨度 3 天的假期，验证系统自动计算的天数。
•	Case 2: 假期分配 (Entitlements) - 为特定员工分配年假额度。
•	Case 3: 审批流程模拟 - 申请一个假期，然后模拟管理员角色（或刷新页面）验证状态变为 Pending Approval。
•	Case 4: 假期列表筛选 - 验证按“已取消”、“已拒绝”等不同状态过滤的效果。
3. test.describe('Time Module - Timesheets & Attendance')
复杂度：中（涉及动态表格和时间戳）
•	Case 1: 打卡功能 (Punch In/Out) - 点击打卡，记录当前时间，验证状态切换。
•	Case 2: 修改工时表 (Timesheet) - 在动态生成的表格中输入每天的工时，并保存。
•	Case 3: 客户/项目关联 - 验证在工时表中是否能正确联想并选择已有的项目。
4. test.describe('My Info - Employee Self-Service')
复杂度：中（侧重数据持久化验证）
•	Case 1: 修改联系方式 - 更新个人电话、邮箱，保存后刷新页面，验证数据未丢失。
•	Case 2: 紧急联系人列表 - 练习在 Table 结构中通过特定文本定位“编辑”或“删除”按钮。
•	Case 3: 个人详情页截图对比 - 确保个人信息页的 UI 布局在不同数据填充下保持正常。
5. test.describe('Performance - Reviews & KPIs')
复杂度：中（侧重复杂 UI 组件）
•	Case 1: 设定 KPI - 填写评分权重，练习下拉框（Select）和滑动条（如果存在）的操作。
•	Case 2: 绩效追踪器 - 记录一条绩效日志并验证时间线（Timeline）的展示。
6. test.describe('Dashboard - Data Visualization')
复杂度：低（侧重视觉回归）
•	Case 1: 全局布局视觉回归测试 - 使用 expect(page).toHaveScreenshot({ mask: [...] }) 屏蔽动态的时钟和图表，验证整体框架。
•	Case 2: 快捷操作链接导航 - 点击 Dashboard 上的“Assign Leave”快捷图标，验证是否跳转到正确页面。
7. test.describe('Directory - Employee Search')
复杂度：低（侧重基础搜索）
•	Case 1: 模糊搜索验证 - 输入不完整的名字，验证返回的结果集中是否包含该关键字。
8. test.describe('Buzz - Corporate Social Media')
复杂度：低/中（侧重动态内容加载）
•	Case 1: 发布动态 - 发帖并立即验证新贴出现在瀑布流顶部。
•	Case 2: 模拟滚动加载 (Infinite Scroll) - 向下滚动页面，验证旧帖子是否通过异步请求加载出来。
________________________________________
9. test.describe('Exception & Advanced Scenarios - 异常与特殊情况')
这一部分是你冲击 Expert 级别的核心。
•	Case 1: 模拟后端 500 崩溃
o	操作： 拦截 PIM 保存接口 page.route。
o	断言： 前端是否弹出显眼的“服务器错误”提示，而不是没有任何反应。
•	Case 2: 网络连接极其缓慢 (Latence Mock)
o	操作： 给 API 请求增加 15 秒延迟。
o	验证： 前端是否显示了全屏 Loading 遮罩，且“提交”按钮被禁用（防止重复提交）。
•	Case 3: 模拟 403 权限被拒绝
o	操作： 当员工尝试访问 Admin 模块接口时，Mock 返回 403。
o	验证： 验证前端是否引导用户去往“Access Denied”页面。
•	Case 4: 接口返回异常数据格式
o	操作： 拦截员工列表接口，将本应是 Array 的数据 Mock 成 String。
o	验证： 检查页面是否崩溃（白屏），以此评估前端的错误边界处理。
•	Case 5: 离线状态模拟 (Offline Mode)
o	操作： 使用 context.setOffline(true)。
o	验证： 验证系统是否有断网提示（该功能取决于 OrangeHRM 前端是否实现了该逻辑）。
________________________________________
给你的专业建议：
1.	关于 state.json：在执行这些测试之前，请务必先写一个 auth.setup.ts。在 beforeAll 中登录一次，把状态存入 state.json（记得在 .gitignore 里忽略它，如你之前所做）。
2.	POM 模式：为这 8 个模块分别建立 pages/ 目录下的类文件。
3.	异常处理的精髓：真正的专家不会只写成功的脚本，能够精准地通过 Mock 技术模拟出各种“倒霉”的场景，才是核心竞争力。
你需要针对其中某个具体模块（比如最难的 PIM 或 异常处理）看看具体的 TypeScript 代码实现吗？
