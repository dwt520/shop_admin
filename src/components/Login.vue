<template>
  <div class="login">
    <el-form status-icon ref="form" :model="form" :rules="rules" label-width="80px">
      <img src="../assets/avatar.jpg" alt>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          @keyup.enter.native="login"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login">登录</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
// 导入axios
export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          // 非空校验 trigger： blur  change
          { required: true, message: '用户名不能为空', trigger: 'change' },
          {
            min: 3,
            max: 9,
            message: '用户长度在 3 到 9 个字符',
            trigger: 'change'
          }
        ],
        password: [
          // 非空校验
          { required: true, message: '密码不能为空', trigger: 'change' },
          {
            min: 6,
            max: 12,
            message: '用户长度在 6 到 12 个字符',
            trigger: 'change'
          }
        ]
      }
    }
  },
  methods: {
    reset() {
      this.$refs.form.resetFields()
    },
    login() {
      this.$refs.form.validate(async valid => {
        // console.log(this.form)

        if (!valid) return false
        // alert('校验成功')
        let res = await this.axios({
          method: 'post',
          url: 'login',
          data: this.form
        })
        console.log(res.data)
        let {
          meta: { status, msg },
          data: { token }
        } = res
        if (status === 200) {
          console.log(msg)
          localStorage.setItem('token', token)
          // 提示框:成功
          this.$message({
            message: '恭喜你，登陆成功',
            type: 'success'
          })
          this.$router.push('/home')
        } else {
          // console.log(res.data.meta.msg)
          this.$message.error(msg)
        }
      })
    }
  }
}
</script>

<style lang="less">
// 注意:vue-cli把所有的loader都配置好了,但是没有把依赖项全部都下载下来

.login {
  height: 100%;
  width: 100%;
  background-color: #2d434c;
  overflow: hidden;
  .el-form {
    width: 400px;
    background-color: #fff;
    margin: 200px auto;
    padding: 75px 40px 15px;
    position: relative;
    border-radius: 20px;
    img {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: -70px;
      border-radius: 50%;
      border: 10px solid #fff;
    }
  }
  .el-button:nth-child(2) {
    margin-left: 70px;
  }
}
</style>
