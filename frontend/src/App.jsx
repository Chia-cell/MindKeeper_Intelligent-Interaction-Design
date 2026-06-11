/* eslint-disable */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Layout, Input, Select, Button, Card, Avatar, Switch, Tag, message, Spin, Badge, Tooltip, Drawer, Divider, Menu, Modal, Radio, Slider, Progress } from 'antd';
import { 
  SearchOutlined, 
  LikeOutlined, 
  DislikeOutlined, 
  BlockOutlined, 
  UserOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  ReloadOutlined,
  SettingOutlined,
  CheckOutlined,
  GlobalOutlined,
  StarOutlined,
  HomeOutlined,
  CompassOutlined,
  HeartOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  FilterOutlined,
  HistoryOutlined,
  TrophyOutlined,
  BookOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';

const { Header, Content, Footer, Sider } = Layout;
const { Search } = Input;
const { Option } = Select;

function App() {
  // 状态管理
  const [mode, setMode] = useState(true);
  const [currentMenu, setCurrentMenu] = useState('home');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [contentType, setContentType] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [preferenceModalVisible, setPreferenceModalVisible] = useState(false);
  const [filterMetrics, setFilterMetrics] = useState({
    relevance: 0.75,
    quality: 0.82,
    timeliness: 0.68,
    overall: 0.78
  });

  // 偏好设置状态
  const [preferredCategories, setPreferredCategories] = useState(['科技', 'AI', '产品']);
  const [blockedKeywords, setBlockedKeywords] = useState([]);
  const [newBlockedKeyword, setNewBlockedKeyword] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setIsLoggedIn(true);
      fetchUserProfile(userId);
    }
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/user_profile?user_id=${userId}`);
      setUserProfile(response.data);
      if (response.data?.preferred_categories) {
        setPreferredCategories(response.data.preferred_categories);
      }
      if (response.data?.blocked_keywords) {
        setBlockedKeywords(response.data.blocked_keywords);
      }
    } catch (error) {
      console.log('无画像或匿名模式');
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword) {
      message.warning('请输入搜索关键词');
      return;
    }
    setLoading(true);
    setCurrentMenu('search');
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.post('http://localhost:8000/api/search', {
        keyword: searchKeyword,
        content_type: contentType,
        mode: mode,
        user_id: userId || null
      });
      setResults(response.data.results);
      if (mode && response.data.updated_profile) {
        setUserProfile(response.data.updated_profile);
      }
      message.success(`找到 ${response.data.results.length} 条优质内容`);
    } catch (error) {
      console.error(error);
      message.error('搜索失败，请确保后端服务已启动');
    } finally {
      setLoading(false);
    }
  };

  const handlePreference = async (contentId, action) => {
    const actionText = { like: '增加此类', dislike: '减少此类', block: '屏蔽' };
    try {
      await axios.post('http://localhost:8000/api/preference', {
        content_id: contentId,
        action: action,
        mode: mode,
        user_id: localStorage.getItem('userId')
      });
      message.success(`已${actionText[action]}`);
      if (mode && localStorage.getItem('userId')) {
        const profileRes = await axios.get(`http://localhost:8000/api/user_profile?user_id=${localStorage.getItem('userId')}`);
        setUserProfile(profileRes.data);
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleLogin = () => {
    const fakeUserId = 'user_' + Date.now();
    localStorage.setItem('userId', fakeUserId);
    setIsLoggedIn(true);
    message.success('登录成功');
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setResults([]);
    setUserProfile(null);
    message.info('已退出登录');
  };

  const addBlockedKeyword = () => {
    if (newBlockedKeyword && !blockedKeywords.includes(newBlockedKeyword)) {
      setBlockedKeywords([...blockedKeywords, newBlockedKeyword]);
      setNewBlockedKeyword('');
      message.success(`已屏蔽关键词：${newBlockedKeyword}`);
    }
  };

  const removeBlockedKeyword = (keyword) => {
    setBlockedKeywords(blockedKeywords.filter(k => k !== keyword));
    message.info(`已取消屏蔽：${keyword}`);
  };

  // 雷达图配置
  const radarOption = {
    title: { 
      text: 'AI 实时筛选标准', 
      left: 'center', 
      top: 0,
      textStyle: { fontSize: 14, fontWeight: 'normal', color: '#1f2937' }
    },
    tooltip: { trigger: 'item' },
    radar: {
      indicator: [
        { name: '相关性', max: 1 },
        { name: '质量分', max: 1 },
        { name: '时效性', max: 1 },
        { name: '综合分', max: 1 }
      ],
      shape: 'circle',
      center: ['50%', '50%'],
      radius: '60%',
      name: { textStyle: { fontSize: 12, fontWeight: 500 } }
    },
    series: [{
      type: 'radar',
      data: [{ 
        value: [filterMetrics.relevance, filterMetrics.quality, filterMetrics.timeliness, filterMetrics.overall], 
        name: '当前标准' 
      }],
      areaStyle: { color: 'rgba(99, 102, 241, 0.2)' },
      lineStyle: { color: '#6366f1', width: 2 },
      itemStyle: { color: '#6366f1' }
    }]
  };

  const profileRadarOption = userProfile?.tags && Object.keys(userProfile.tags).length > 0 ? {
    title: { 
      text: '你的兴趣画像', 
      left: 'center', 
      top: 0,
      textStyle: { fontSize: 14, fontWeight: 'normal', color: '#1f2937' }
    },
    tooltip: { trigger: 'item' },
    radar: {
      indicator: Object.keys(userProfile.tags).map(tag => ({ name: tag, max: 1 })),
      shape: 'circle',
      center: ['50%', '50%'],
      radius: '60%',
      name: { textStyle: { fontSize: 11 } }
    },
    series: [{
      type: 'radar',
      data: [{ value: Object.values(userProfile.tags), name: '偏好权重' }],
      areaStyle: { color: 'rgba(34, 197, 94, 0.2)' },
      lineStyle: { color: '#22c55e', width: 2 },
      itemStyle: { color: '#22c55e' }
    }]
  } : null;

  const getScoreColor = (score) => {
    if (score >= 0.8) return '#22c55e';
    if (score >= 0.6) return '#eab308';
    return '#ef4444';
  };

  const getScoreTag = (score) => {
    if (score >= 0.8) return <Tag color="success">优秀</Tag>;
    if (score >= 0.6) return <Tag color="warning">良好</Tag>;
    return <Tag color="error">一般</Tag>;
  };

  // 侧边栏菜单项
  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: '首页推荐' },
    { key: 'search', icon: <SearchOutlined />, label: '智能搜索' },
    { key: 'profile', icon: <UserOutlined />, label: '我的画像' },
    { key: 'preferences', icon: <HeartOutlined />, label: '偏好管理' },
    { key: 'quality', icon: <TrophyOutlined />, label: '质量榜单' }
  ];

  // 登录页
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 400,
          height: 400,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%'
        }} />
        
        <Card style={{ 
          width: 460, 
          textAlign: 'center', 
          borderRadius: 24,
          backdropFilter: 'blur(10px)',
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          border: 'none'
        }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ 
              width: 72, 
              height: 72, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 24,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <RobotOutlined style={{ fontSize: 36, color: 'white' }} />
            </div>
            <h1 style={{ fontSize: 32, marginBottom: 8, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MindKeeper
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 0 }}>智寻·灵境 —— 智能内容筛选与个性化推送平台</p>
          </div>
          
          <Divider style={{ margin: '16px 0' }}>
            <Tag icon={<SafetyOutlined />} color="processing">严格一人一号</Tag>
          </Divider>
          
          <div style={{ textAlign: 'left', marginBottom: 24, background: '#f3f4f6', padding: 16, borderRadius: 12 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <CheckOutlined style={{ color: '#22c55e' }} />
              <span style={{ fontSize: 13, color: '#4b5563' }}>大模型全网智能筛选</span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <CheckOutlined style={{ color: '#22c55e' }} />
              <span style={{ fontSize: 13, color: '#4b5563' }}>双模式设计 · 隐私可控</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <CheckOutlined style={{ color: '#22c55e' }} />
              <span style={{ fontSize: 13, color: '#4b5563' }}>主动偏好干预 · 打破信息茧房</span>
            </div>
          </div>
          
          <Button 
            type="primary" 
            size="large" 
            onClick={handleLogin} 
            block
            style={{ 
              height: 48, 
              borderRadius: 12, 
              fontSize: 16,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            开始使用
          </Button>
          
          <div style={{ marginTop: 20, fontSize: 12, color: '#9ca3af' }}>
            🔒 演示模式 · 正式版将接入手机号验证
          </div>
        </Card>
      </div>
    );
  }

  // 主界面
  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* 侧边栏 */}
      <Sider
        width={260}
        style={{
          background: 'white',
          boxShadow: '1px 0 0 0 rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto'
        }}
      >
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <RobotOutlined style={{ fontSize: 22, color: 'white' }} />
            </div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                MindKeeper
              </span>
              <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 6 }}>v2.0</span>
            </div>
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[currentMenu]}
          items={menuItems}
          onClick={({ key }) => setCurrentMenu(key)}
          style={{ borderRight: 'none', padding: '8px 0' }}
        />

        <div style={{ padding: '20px', borderTop: '1px solid #f0f0f0', marginTop: 'auto', position: 'absolute', bottom: 0, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>智能推送模式</span>
            <Switch 
              checked={mode} 
              onChange={setMode} 
              checkedChildren="灵境" 
              unCheckedChildren="净土"
              size="small"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} style={{ background: '#6366f1', width: 32, height: 32 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>我的账号</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>点击退出</div>
              </div>
            </div>
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} size="small" danger />
          </div>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 0 }}>
        {/* 顶部导航 */}
        <Header style={{
          background: 'white',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 0 0 rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 99
        }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#1f2937' }}>
              {menuItems.find(i => i.key === currentMenu)?.label || '首页推荐'}
            </span>
            <Badge count={mode ? '灵境模式' : '净土模式'} style={{ backgroundColor: mode ? '#6366f1' : '#9ca3af', marginLeft: 12 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Tooltip title="设置">
              <Button type="text" icon={<SettingOutlined />} onClick={() => setSettingsVisible(true)} />
            </Tooltip>
          </div>
        </Header>

        <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          
          {/* ===== 首页推荐界面 ===== */}
          {currentMenu === 'home' && (
            <div>
              {/* 欢迎卡片 */}
              <Card style={{ borderRadius: 16, marginBottom: 24, background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22 }}>下午好，探索者 👋</h2>
                    <p style={{ margin: '8px 0 0', color: '#6b7280' }}>
                      {mode ? '灵境模式已开启 · 你的偏好正在塑造更好的推荐' : '净土模式 · 本次会话不保留任何记录'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <Tag icon={<TrophyOutlined />} color="gold">今日推荐 6 篇</Tag>
                    <Tag icon={<HistoryOutlined />} color="blue">本周已读 23 篇</Tag>
                  </div>
                </div>
              </Card>

              {/* AI 筛选标准雷达图 */}
              <div style={{
                background: 'white',
                borderRadius: 20,
                padding: 20,
                marginBottom: 24,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}>
                <div style={{ height: 260 }}>
                  <ReactECharts option={radarOption} style={{ height: '100%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
                  <Tag color="blue">相关性 {Math.round(filterMetrics.relevance * 100)}%</Tag>
                  <Tag color="green">质量分 {Math.round(filterMetrics.quality * 100)}%</Tag>
                  <Tag color="orange">时效性 {Math.round(filterMetrics.timeliness * 100)}%</Tag>
                  <Tag color="purple">综合分 {Math.round(filterMetrics.overall * 100)}%</Tag>
                </div>
              </div>

              {/* 用户画像雷达图 */}
              {mode && profileRadarOption && (
                <div style={{
                  background: 'white',
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 24,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ height: 260 }}>
                    <ReactECharts option={profileRadarOption} style={{ height: '100%' }} />
                  </div>
                  <p style={{ textAlign: 'center', color: '#6b7280', marginTop: 12, fontSize: 12 }}>
                    ✨ 基于你的搜索与反馈实时更新
                  </p>
                </div>
              )}

              {/* 今日推荐内容 */}
              <h3 style={{ marginBottom: 16 }}>🔥 今日推荐</h3>
              {results.length === 0 ? (
                <Card style={{ textAlign: 'center', borderRadius: 16, background: '#fafbfc' }}>
                  <SearchOutlined style={{ fontSize: 48, color: '#d1d5db', marginBottom: 16 }} />
                  <p style={{ color: '#9ca3af' }}>点击「智能搜索」开始探索</p>
                </Card>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                  {results.slice(0, 6).map((item, idx) => (
                    <ResultCard key={idx} item={item} onPreference={handlePreference} getScoreTag={getScoreTag} getScoreColor={getScoreColor} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== 智能搜索界面 ===== */}
          {currentMenu === 'search' && (
            <div>
              <Card style={{ borderRadius: 16, marginBottom: 24, border: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <Search
                    placeholder="输入关键词，AI 将全网筛选优质内容..."
                    enterButton={<SearchOutlined />}
                    size="large"
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    onSearch={handleSearch}
                    loading={loading}
                    style={{ flex: 1, minWidth: 200 }}
                  />
                  <Select defaultValue="all" style={{ width: 130 }} onChange={setContentType} size="large">
                    <Option value="all">📱 全部形式</Option>
                    <Option value="article">📄 文章</Option>
                    <Option value="video">🎬 视频</Option>
                    <Option value="gallery">🖼️ 图文</Option>
                  </Select>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                  {['AI 大模型', '产品经理', '编程入门', '科技前沿', '深度阅读'].map(tag => (
                    <Tag 
                      key={tag}
                      style={{ cursor: 'pointer', borderRadius: 20, padding: '4px 12px' }}
                      onClick={() => setSearchKeyword(tag)}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              </Card>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                  <Spin size="large" tip="AI 正在筛选优质内容..." />
                </div>
              ) : results.length === 0 ? (
                <Card style={{ textAlign: 'center', borderRadius: 16, background: '#fafbfc' }}>
                  <RobotOutlined style={{ fontSize: 48, color: '#d1d5db', marginBottom: 16 }} />
                  <p style={{ color: '#9ca3af' }}>输入关键词开始搜索，AI 将为你筛选全网优质内容</p>
                </Card>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0 }}>搜索结果 <span style={{ fontSize: 14, color: '#9ca3af' }}>共 {results.length} 条</span></h3>
                    <Button icon={<ReloadOutlined />} onClick={handleSearch} loading={loading}>刷新</Button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                    {results.map((item, idx) => (
                      <ResultCard key={idx} item={item} onPreference={handlePreference} getScoreTag={getScoreTag} getScoreColor={getScoreColor} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== 我的画像界面 ===== */}
          {currentMenu === 'profile' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <Card style={{ borderRadius: 16 }}>
                  <h3>📊 兴趣画像</h3>
                  {profileRadarOption ? (
                    <div style={{ height: 300 }}>
                      <ReactECharts option={profileRadarOption} style={{ height: '100%' }} />
                    </div>
                  ) : (
                    <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>
                      {mode ? '暂无画像数据，开始搜索吧' : '净土模式下不记录画像'}
                    </p>
                  )}
                </Card>

                <Card style={{ borderRadius: 16 }}>
                  <h3>📈 使用统计</h3>
                  <div style={{ marginTop: 20 }}>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>本周活跃度</span>
                        <span style={{ color: '#6366f1' }}>65%</span>
                      </div>
                      <Progress percent={65} strokeColor="#6366f1" showInfo={false} />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>内容偏好匹配度</span>
                        <span style={{ color: '#22c55e' }}>82%</span>
                      </div>
                      <Progress percent={82} strokeColor="#22c55e" showInfo={false} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>筛选节省时间</span>
                        <span style={{ color: '#eab308' }}>47h</span>
                      </div>
                      <Progress percent={47} strokeColor="#eab308" showInfo={false} />
                    </div>
                  </div>
                </Card>
              </div>

              <Card style={{ borderRadius: 16, marginTop: 24 }}>
                <h3>📋 近期兴趣标签</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                  {preferredCategories.map(cat => (
                    <Tag key={cat} color="blue" style={{ padding: '4px 12px', borderRadius: 20 }}>{cat}</Tag>
                  ))}
                  {!mode && <span style={{ color: '#9ca3af' }}>净土模式下不记录标签</span>}
                </div>
              </Card>
            </div>
          )}

          {/* ===== 偏好管理界面 ===== */}
          {currentMenu === 'preferences' && (
            <div>
              <Card style={{ borderRadius: 16, marginBottom: 24 }}>
                <h3>❤️ 内容偏好设置</h3>
                <p style={{ color: '#6b7280', marginBottom: 20 }}>告诉 MindKeeper 你喜欢什么，不喜欢什么</p>
                
                <Divider orientation="left">优先推荐的内容类型</Divider>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {['科技', 'AI', '产品', '商业', '人文', '健康', '教育', '设计'].map(cat => (
                    <Tag
                      key={cat}
                      color={preferredCategories.includes(cat) ? 'blue' : 'default'}
                      style={{ cursor: 'pointer', padding: '4px 12px', borderRadius: 20 }}
                      onClick={() => {
                        if (preferredCategories.includes(cat)) {
                          setPreferredCategories(preferredCategories.filter(c => c !== cat));
                        } else {
                          setPreferredCategories([...preferredCategories, cat]);
                        }
                        message.info(`已${preferredCategories.includes(cat) ? '移除' : '添加'}：${cat}`);
                      }}
                    >
                      {cat}
                    </Tag>
                  ))}
                </div>

                <Divider orientation="left" style={{ marginTop: 24 }}>屏蔽关键词</Divider>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <Input
                    placeholder="输入要屏蔽的关键词"
                    value={newBlockedKeyword}
                    onChange={e => setNewBlockedKeyword(e.target.value)}
                    onPressEnter={addBlockedKeyword}
                    style={{ width: 200 }}
                  />
                  <Button type="primary" onClick={addBlockedKeyword}>添加屏蔽</Button>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {blockedKeywords.map(keyword => (
                    <Tag
                      key={keyword}
                      closable
                      onClose={() => removeBlockedKeyword(keyword)}
                      color="error"
                      style={{ padding: '4px 12px', borderRadius: 20 }}
                    >
                      🚫 {keyword}
                    </Tag>
                  ))}
                  {blockedKeywords.length === 0 && (
                    <span style={{ color: '#9ca3af' }}>暂无屏蔽关键词</span>
                  )}
                </div>

                <Divider orientation="left" style={{ marginTop: 24 }}>推送模式</Divider>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>智能个性化推送</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>开启后，系统会记住你的偏好并优化推荐</div>
                  </div>
                  <Switch checked={mode} onChange={setMode} checkedChildren="灵境" unCheckedChildren="净土" />
                </div>
              </Card>
            </div>
          )}

          {/* ===== 质量榜单界面 ===== */}
          {currentMenu === 'quality' && (
            <div>
              <Card style={{ borderRadius: 16, marginBottom: 24, background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                <div style={{ textAlign: 'center' }}>
                  <TrophyOutlined style={{ fontSize: 40, color: '#eab308' }} />
                  <h2 style={{ margin: '12px 0 8px' }}>今日必读 · 精选</h2>
                  <p style={{ color: '#92400e', margin: 0 }}>AI 从全网上万篇内容中筛选出的 5 篇深度好文</p>
                </div>
              </Card>

              {['DeepSeek R2 模型技术深度解析', '2025年AI产品经理生存指南', '用RAG构建企业知识库的完整实践', '硅谷AI创业公司最新融资动态', 'Stable Diffusion 3 实战教程'].map((title, idx) => (
                <Card key={idx} style={{ borderRadius: 12, marginBottom: 16, cursor: 'pointer' }} hoverable>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <Tag color="gold">⭐ 编辑推荐</Tag>
                        <Tag color="green">AI评分 0.92</Tag>
                      </div>
                      <h4 style={{ margin: 0 }}>{title}</h4>
                      <p style={{ color: '#6b7280', marginTop: 8, fontSize: 13 }}>这是一篇深度分析内容，包含前沿技术和行业洞察...</p>
                    </div>
                    <Button type="link">阅读全文 →</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Content>

        <Footer style={{ textAlign: 'center', background: 'transparent', color: '#9ca3af', padding: '24px' }}>
          MindKeeper · 智寻灵境 —— 帮你找到值得看的内容
        </Footer>
      </Layout>

      {/* 设置抽屉 */}
      <Drawer
        title="设置"
        placement="right"
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        width={300}
      >
        <div>
          <h4>关于 MindKeeper</h4>
          <p style={{ fontSize: 13, color: '#6b7280' }}>
            基于大模型智能筛选的内容发现平台，致力于帮助用户高效获取高质量内容。
          </p>
          <Divider />
          <h4>版本</h4>
          <p style={{ fontSize: 13, color: '#6b7280' }}>v2.0.0 · 2026</p>
          <Divider />
          <h4>反馈</h4>
          <p style={{ fontSize: 13, color: '#6b7280' }}>如有问题请联系：support@mindkeeper.com</p>
        </div>
      </Drawer>
    </Layout>
  );
}

// 结果卡片组件
const ResultCard = ({ item, onPreference, getScoreTag, getScoreColor }) => (
  <Card
    hoverable
    style={{ borderRadius: 16, overflow: 'hidden', transition: 'all 0.3s ease' }}
    className="result-card"
    cover={
      item.cover ? (
        <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
          <img 
            alt={item.title} 
            src={item.cover} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            {getScoreTag(item.ai_score)}
          </div>
        </div>
      ) : (
        <div style={{ height: 100, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RobotOutlined style={{ fontSize: 40, color: 'rgba(255,255,255,0.3)' }} />
        </div>
      )
    }
    actions={[
      <Tooltip title="想看更多此类内容">
        <Button type="text" icon={<LikeOutlined />} onClick={() => onPreference(item.id, 'like')} style={{ color: '#22c55e' }}>想看更多</Button>
      </Tooltip>,
      <Tooltip title="减少此类推荐">
        <Button type="text" icon={<DislikeOutlined />} onClick={() => onPreference(item.id, 'dislike')} style={{ color: '#eab308' }}>减少推荐</Button>
      </Tooltip>,
      <Tooltip title="彻底屏蔽">
        <Button type="text" icon={<BlockOutlined />} onClick={() => onPreference(item.id, 'block')} style={{ color: '#ef4444' }}>屏蔽</Button>
      </Tooltip>
    ]}
  >
    <Card.Meta
      title={
        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, fontWeight: 500, color: '#1f2937' }}>
          {item.title}
        </a>
      }
      description={
        <div>
          <p style={{ marginBottom: 12, color: '#6b7280', fontSize: 13 }}>{item.summary}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tag>{item.content_type === 'article' ? '📄 文章' : item.content_type === 'video' ? '🎬 视频' : '🖼️ 图文'}</Tag>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <StarOutlined style={{ fontSize: 12, color: getScoreColor(item.ai_score) }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: getScoreColor(item.ai_score) }}>
                {(item.ai_score * 100).toFixed(0)}分
              </span>
            </div>
            {item.source && <span style={{ fontSize: 12, color: '#9ca3af' }}>📌 {item.source}</span>}
          </div>
        </div>
      }
    />
  </Card>
);

export default App;