<template>
  <div class="user">
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索区域 -->
    <el-input placeholder="请输入搜索内容" v-model="query" class="input-with-select">
      <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
    </el-input>
    <el-button type="success" plain @click="showUserDialog">添加用户</el-button>
    <!-- 用户列表 -->
    <el-table :data="userList" style="width: 100%">
      <el-table-column prop="username" label="姓名" width="180"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>
      <el-table-column prop="mg_state" label="用户状态">
        <template slot-scope="scope">
          <!-- {{scope.row}} -->
          <el-switch
            v-model="scope.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="changeStatus(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            plain
            size="mini"
            @click="showEditDialog(scope.row)"
          ></el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            plain
            size="mini"
            @click="delUsers(scope.row.id)"
          ></el-button>
          <el-button
            type="success"
            @click="showAssignDialog(scope.row)"
            icon="el-icon-check"
            plain
            size="mini"
          >分配角色</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[2, 4, 6, 8]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
    <!-- 添加用户模态框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="40%">
      <el-form :model="addForm" label-width="80px" :rules="rules" ref="addForm" status-icon>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile" placeholder="请输入手机号"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑模态框 -->
    <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="40%">
      <el-form :model="editForm" label-width="80px" ref="editForm">
        <el-form-item label="用户名">
          <el-tag type="info">{{editForm.username}}</el-tag>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色模态框 -->
    <el-dialog title="分配角色" :visible.sync="assignDialogVisible" width="40%">
      <el-form :model="assignForm" label-width="80px" ref="assignForm" :rules="rules" status-icon>
        <el-form-item label="用户名">
          <el-tag type="info">{{assignForm.username}}</el-tag>
        </el-form-item>
        <el-form-item label="角色列表" prop="rid">
          <el-select v-model="assignForm.rid" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="assignRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userList: [],
      query: '',
      pageSize: 2,
      currentPage: 1,
      total: 0,
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'change' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'change' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'change' },
          {
            min: 6,
            max: 12,
            message: '长度在 6 到 12 个字符',
            trigger: 'change'
          }
        ],
        email: [
          { message: '请输入正确的邮箱', trigger: 'change', type: 'email' }
        ],
        mobile: [
          {
            message: '请输入合法的手机号',
            trigger: 'change',
            pattern: /^1\d{10}$/
          }
        ]
      },
      editDialogVisible: false,
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      assignDialogVisible: false,
      assignForm: {
        id: '',
        username: '',
        rid: ''
      },
      roleList: []
    }
  },
  methods: {
    getUserList() {
      this.axios({
        method: 'get',
        url: 'users',
        params: {
          query: this.query,
          pagenum: this.currentPage,
          pagesize: this.pageSize
        }
      }).then(res => {
        console.log(res.data)
        let {
          meta: { status },
          data: { users, total }
        } = res
        if (status === 200) {
          this.userList = users
          this.total = total
        }
      })
    },
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`)
      this.pageSize = val
      this.getUserList()
    },
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`)
      this.currentPage = val
      this.getUserList()
    },
    search() {
      alert(1)
      // 搜索的时候,把当前页当成第一页
      this.currentPage = 1
      this.getUserList()
    },
    async delUsers(id) {
      try {
        await this.$confirm('您确定删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        let res = await this.axios({
          method: 'delete',
          url: `users/${id}`
        })
        let {
          meta: { status }
        } = res
        if (status === 200) {
          if (this.userList.length <= 1 && this.currentPage > 1) {
            this.currentPage--
          }
          this.getUserList()
          this.$message.success('删除成功')
        }
      } catch (e) {
        this.$message.info('取消删除')
      }
    },
    async changeStatus(row) {
      console.log(row.mg_state)
      let res = await this.axios({
        method: 'put',
        url: `users/${row.id}/state/${row.mg_state}`
      })
      console.log(res)
      let {
        meta: { status }
      } = res
      if (status === 200) {
        this.$message.success('修改成功')
      } else {
        this.$message.error('修改失败')
      }
    },
    showUserDialog() {
      this.addDialogVisible = true
    },
    addUser() {
      this.$refs.addForm.validate(async vaild => {
        if (!vaild) return false
        let res = await this.axios({
          method: 'post',
          url: 'users',
          data: this.addForm
        })
        console.log(res)
        let {
          meta: { status, msg }
        } = res
        if (status === 201) {
          // 1.创建成功提示
          this.$message.success('添加成功了')
          // 2.关闭模态框
          this.addDialogVisible = false
          // 3.清空内容,重置内容
          this.$refs.addForm.resetFields()
          // 4.重新渲染
          this.getUserList()
          // 总数加1
          this.total++
          this.currentPage = Math.ceil(this.total / this.pageSize)
          // 页数相对可能也要加
        } else {
          this.$message.error(msg)
        }
      })
    },
    showEditDialog(row) {
      this.editDialogVisible = true
      console.log(row)
      this.editForm.username = row.username
      this.editForm.id = row.id
      this.editForm.email = row.email
      this.editForm.mobile = row.mobile
    },
    updateUser() {
      this.$refs.editForm.validate(async valid => {
        if (!valid) return false
        let res = await this.axios({
          method: 'put',
          url: `users/${this.editForm.id}`,
          data: this.editForm
        })
        // console.log(res)
        let {
          meta: { status }
        } = res
        if (status === 200) {
          // 显示提示消息
          this.$message.success('修改成功')
          // 关闭模态框
          this.editDialogVisible = false
          // 重新渲染页面
          this.getUserList()
          // 重置修改表单
          // this.$refs.editForm.resetFields()没有必要
        }
      })
    },
    async getUserInfo(id) {
      let res = await this.axios.get(`users/${id}`)
      console.log(res)

      if (res.meta.status === 200) {
        let rid = res.data.rid
        // this.assignForm.rid = res.data.rid
        if (rid === -1) {
          rid = ''
        }
        this.assignForm.rid = rid
      }
    },
    async showAssignDialog(user) {
      this.assignDialogVisible = true
      this.assignForm.id = user.id
      this.assignForm.username = user.username
      // 获取角色列表
      this.getUserInfo(user.id)
      let res = await this.axios.get('roles')
      // console.log(res)
      if (res.meta.status === 200) {
        this.roleList = res.data
        // console.log(this.roleList)
      }
    },
    async assignRole() {
      if (!this.assignForm.rid) {
        this.$message.error('请选择一个角色')
        return
      }
      let res = await this.axios.put(`users/${this.assignForm.id}/role`, {
        rid: this.assignForm.rid
      })
      // console.log(res)
      if (res.meta.status === 200) {
        // 重置表单,重新渲染
        this.$refs.assignForm.resetFields()
        this.assignDialogVisible = false
        this.getUserList()
        this.$message.success('分配成功')
      }
    }
  },
  created() {
    this.getUserList()
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb {
  height: 50px;
  line-height: 50px;
}
.el-input {
  width: 300px;
  margin-bottom: 5px;
}
</style>
