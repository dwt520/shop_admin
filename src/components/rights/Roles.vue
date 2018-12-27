<template>
  <div class="roles">
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-button type="success" plain @click="showAddDialog">添加角色</el-button>
    <!-- 表格 -->
    <el-table :data="roleList" style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="{row}">
          <!-- {{scope.row}} -->
          <!-- 如果没有分类,显示没有权限 -->
          <span v-if="row.children.length===0">暂无权限</span>
          <!-- 显示一级分类 -->
          <el-row v-for="l1 in row.children" :key="l1.id" class="l1">
            <el-col :span="4">
              <el-tag closable @close="delRight(row,l1.id)">{{l1.authName}}</el-tag>
              <i class="el-icon-arrow-right"></i>
            </el-col>
            <el-col :span="20">
              <!-- 显示二级分类 -->
              <el-row v-for="l2 in l1.children" :key="l2.id" class="l2">
                <el-col :span="4">
                  <el-tag closable type="success" @close="delRight(row,l2.id)">{{l2.authName}}</el-tag>
                  <i class="el-icon-arrow-right"></i>
                </el-col>
                <el-col :span="20">
                  <!-- 显示三级分类 -->
                  <span v-for="l3 in l2.children" :key="l3.id" class="l3">
                    <el-tag closable type="warning" @close="delRight(row,l3.id)">{{l3.authName}}</el-tag>
                  </span>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{row}">
          <el-button
            type="primary"
            icon="el-icon-edit"
            @click="showEditDialog(row)"
            plain
            size="mini"
          ></el-button>
          <el-button type="danger" @click="delRole(row.id)" icon="el-icon-delete" plain size="mini"></el-button>
          <el-button
            type="success"
            @click="showAssignDialog(row)"
            icon="el-icon-check"
            plain
            size="mini"
          >分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分配权限对话框 -->
    <el-dialog title="添加角色" :visible.sync="assignDialogVisible">
      <!-- :data是树形菜单的数据,props用于指定显示的属性以及设置子属性 -->
      <el-tree
        :data="data"
        ref="tree"
        :props="defaultProps"
        show-checkbox
        node-key="id"
        default-expand-all
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="assignRight">分 配</el-button>
      </span>
    </el-dialog>
    <!-- 角色添加对话框 -->
    <el-dialog :title="this.addForm.id?'修改角色':'添加角色'" :visible.sync="addDialogVisible">
      <el-form ref="addForm" :model="addForm" label-width="80px" :rules="rules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc" placeholder="请输入角色描述"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      roleId: '',
      assignDialogVisible: false,
      data: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      addDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: '',
        id: ''
      },
      rules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    async getRoleList() {
      let res = await this.axios.get('roles')
      // console.log(res)
      let {
        meta: { status }
      } = res
      if (status === 200) {
        this.roleList = res.data
        // console.log(this.roleList)
      }
    },
    async delRight(role, roleId) {
      let res = await this.axios.delete(`roles/${role.id}/rights/${roleId}`)
      // console.log(res)
      let {
        meta: { status },
        data
      } = res
      if (status === 200) {
        role.children = data
        this.$message.success('取消权限成功')
      } else {
        this.$message.info('取消权限失败')
      }
    },
    async showAssignDialog(role) {
      this.assignDialogVisible = true
      this.roleId = role.id
      let res = await this.axios.get('rights/tree')
      // console.log(res)
      let {
        meta: { status },
        data
      } = res
      if (status === 200) {
        this.data = data
        // console.log(this.data)
      }
      // console.log(role)
      // this.$refs.tree.setCheckedKeys([105])
      let ids = []
      role.children.forEach(l1 => {
        l1.children.forEach(l2 => {
          l2.children.forEach(l3 => {
            ids.push(l3.id)
          })
        })
      })
      this.$refs.tree.setCheckedKeys(ids)
    },
    async assignRight() {
      let checkedkeys = this.$refs.tree.getCheckedKeys()
      let halfCheckedKeys = this.$refs.tree.getHalfCheckedKeys()
      let rids = checkedkeys.concat(halfCheckedKeys).join()
      let res = await this.axios.post(`roles/${this.roleId}/rights`, { rids })
      console.log(res)
      let {
        meta: { status }
      } = res
      if (status === 200) {
        this.getRoleList()
        this.assignDialogVisible = false
        this.$message.success('分配成功')
      } else {
        this.$message.success('分配失败')
      }
    },
    showAddDialog() {
      this.addDialogVisible = true
      this.addForm.roleName = ''
      this.addForm.roleDesc = ''
      this.addForm.id = ''
    },
    saveRole() {
      this.$refs.addForm.validate(async valid => {
        if (!valid) return false
        let id = this.addForm.id
        let method = id ? 'put' : 'post'
        let url = id ? `roles/${id}` : `roles`
        let status = id ? 200 : 201
        let res = await this.axios({
          method,
          url,
          data: this.addForm
        })
        console.log(res)
        if (res.meta.status === status) {
          // 重新渲染,重置,关闭模态框,提示消息
          this.getRoleList()
          this.$refs.addForm.resetFields()
          this.addDialogVisible = false
          this.$message.success('操作成功')
        } else {
          this.$message.error('操作失败')
        }
      })
    },
    showEditDialog(role) {
      this.addDialogVisible = true
      this.addForm.roleName = role.roleName
      this.addForm.roleDesc = role.roleDesc
      this.addForm.id = role.id
    },
    async delRole(id) {
      try {
        await this.$confirm('你确定要删除这个角色吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        let res = await this.axios.delete(`roles/${id}`)
        console.log(res)
        let {
          meta: { status }
        } = res
        if (status === 200) {
          this.getRoleList()
          this.$message.success('删除成功')
        }
      } catch (e) {
        this.$message.info('已取消删除')
      }
    }
  },
  created() {
    this.getRoleList()
  }
}
</script>

<style lang="less" scoped>
.l1 {
  border-bottom: 1px dotted #ccc;
  padding: 10px 0;
}
.l2 {
  margin-bottom: 5px;
}

.l3 {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>
