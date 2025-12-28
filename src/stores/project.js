import { defineStore } from 'pinia'
import { ProjectAPI } from '@/api/project'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
    pagination: {
      count: 0,
      next: null,
      previous: null,
      currentPage: 1,
      pageSize: 20
    },
    filters: {
      search: '',
      status: 'active', // 默认显示进行中的项目
      ordering: '-created_at'
    },
    statistics: null
  }),

  getters: {
    getAllProjects: (state) => state.projects,
    getCurrentProject: (state) => state.currentProject,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getPagination: (state) => state.pagination,
    getFilters: (state) => state.filters,
    getStatistics: (state) => state.statistics
  },

  actions: {
    async fetchProjects(params = {}) {
      this.loading = true
      this.error = null
      try {
        const queryParams = {
          page: this.pagination.currentPage,
          page_size: this.pagination.pageSize,
          search: this.filters.search,
          status: this.filters.status,
          ordering: this.filters.ordering,
          ...params
        }
        
        const response = await ProjectAPI.getProjects(queryParams)
        
        if (Array.isArray(response)) {
          this.projects = response
          this.pagination.count = response.length
          this.pagination.next = null
          this.pagination.previous = null
        } else {
          this.projects = response.results || []
          this.pagination.count = response.count
          this.pagination.next = response.next
          this.pagination.previous = response.previous
        }
        
        return response
      } catch (error) {
        this.error = error.message || '获取项目列表失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchProject(id) {
      this.loading = true
      this.error = null
      try {
        const project = await ProjectAPI.getProject(id)
        this.currentProject = project
        return project
      } catch (error) {
        this.error = error.message || '获取项目详情失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createProject(data) {
      this.loading = true
      try {
        const newProject = await ProjectAPI.createProject(data)
        this.projects.unshift(newProject)
        this.pagination.count++
        return newProject
      } catch (error) {
        this.error = error.message || '创建项目失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProject(id, data) {
      this.loading = true
      try {
        const updatedProject = await ProjectAPI.updateProject(id, data)
        const index = this.projects.findIndex(p => p.id === id)
        if (index !== -1) {
          this.projects[index] = updatedProject
        }
        if (this.currentProject && this.currentProject.id === id) {
          this.currentProject = { ...this.currentProject, ...updatedProject }
        }
        return updatedProject
      } catch (error) {
        this.error = error.message || '更新项目失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteProject(id) {
      this.loading = true
      try {
        await ProjectAPI.deleteProject(id)
        this.projects = this.projects.filter(p => p.id !== id)
        this.pagination.count--
        if (this.currentProject && this.currentProject.id === id) {
          this.currentProject = null
        }
      } catch (error) {
        this.error = error.message || '删除项目失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async archiveProject(id) {
      try {
        const updatedProject = await ProjectAPI.archiveProject(id)
        this.updateLocalProject(updatedProject)
        return updatedProject
      } catch (error) {
        throw error
      }
    },

    async activateProject(id) {
      try {
        const updatedProject = await ProjectAPI.activateProject(id)
        this.updateLocalProject(updatedProject)
        return updatedProject
      } catch (error) {
        throw error
      }
    },

    async completeProject(id) {
      try {
        const updatedProject = await ProjectAPI.completeProject(id)
        this.updateLocalProject(updatedProject)
        return updatedProject
      } catch (error) {
        throw error
      }
    },

    async fetchStatistics() {
      try {
        const stats = await ProjectAPI.getStatistics()
        this.statistics = stats
        return stats
      } catch (error) {
        console.error('获取统计失败', error)
      }
    },

    updateLocalProject(project) {
      const index = this.projects.findIndex(p => p.id === project.id)
      if (index !== -1) {
        // 如果当前过滤器状态不匹配，可能需要移除
        if (this.filters.status && this.filters.status !== project.status) {
          this.projects.splice(index, 1)
          this.pagination.count--
        } else {
          this.projects[index] = project
        }
      }
      if (this.currentProject && this.currentProject.id === project.id) {
        this.currentProject = project
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
      this.pagination.currentPage = 1 // 重置页码
    },

    setPage(page) {
      this.pagination.currentPage = page
    }
  }
})
