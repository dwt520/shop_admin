<template>
  <div class="category">
    <el-button type="success" plain @click="showDialog">添加分类</el-button>
    <el-table :data="categoryList">
      <el-table-tree-column
        label="分类名称"
        parentKey="cat_pid"
        levelKey="cat_level"
        :indentSize="20"
        treeKey="cat_id"
        prop="cat_name"
      ></el-table-tree-column>
      <el-table-column label="是否有效" prop="cat_deleted">
        <template slot-scope="{row}">{{row.cat_deleted?'是':'否'}}</template>
      </el-table-column>
      <el-table-column label="排序" prop="cat_level"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{row}">
          <el-button type="primary" icon="el-icon-edit" plain size="mini"></el-button>
          <el-button type="danger" icon="el-icon-delete" plain size="mini"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="40%">
      <el-form :model="addForm" :rules="rules" ref="addForm" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级名称" prop="cat_pid">
          <el-cascader
            :options="options"
            clearable
            change-on-select
            v-model="addForm.cat_pid"
            :props="props"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      categoryList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      addDialogVisible: false,
      addForm: {
        cat_pid: [],
        cat_name: '',
        cat_level: ''
      },
      options: [],
      props: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取商品分类列表
    async getCategoryList() {
      let res = await this.axios.get('categories', {
        params: {
          type: 3,
          pagenum: this.currentPage,
          pagesize: this.pageSize
        }
      })
      let {
        meta: { status },
        data: { result, total }
      } = res
      if (status === 200) {
        this.total = total
        this.categoryList = result
        // console.log(this.categoryList)
      }
      // console.log(res)
    },
    async showDialog() {
      this.addDialogVisible = true
      let res = await this.axios.get('categories?type=2')
      console.log(res)
      if (res.meta.status === 200) {
        this.options = res.data
      }
    },
    addCategory() {
      this.$refs.addForm.validate(async valid => {
        if (!valid) return false
        let res = await this.axios.post('categories', {
          cat_pid: this.addForm.cat_pid[this.addForm.cat_pid.length - 1] || 0,
          cat_name: this.addForm.cat_name,
          cat_level: this.addForm.cat_pid.length
        })
        // console.log(res)
        if (res.meta.status === 201) {
          this.getCategoryList()
          this.$message.success('添加成功')
          this.addDialogVisible = false
          this.$refs.addForm.resetFields()
        }
      })
    }
  },
  created() {
    this.getCategoryList()
  }
}
</script>

<style>
</style>
