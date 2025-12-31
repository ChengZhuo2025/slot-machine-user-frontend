// 酒店相关Mock数据
export default function (Mock, mockResponse, mockPageResponse) {
  // 获取酒店列表
  Mock.mock(/\/api\/hotels(\?|$)/, "get", (options) => {
    const url = new URL("http://localhost" + options.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const pageSize = parseInt(url.searchParams.get("pageSize")) || 10;
    const keyword = url.searchParams.get("keyword");
    const type = url.searchParams.get("type");
    const latitude = parseFloat(url.searchParams.get("latitude")) || 39.9042;
    const longitude = parseFloat(url.searchParams.get("longitude")) || 116.4074;

    const hotels = Mock.mock({
      "list|30": [
        {
          "id|+1": 1,
          name: () =>
            Mock.Random.ctitle(5, 15) +
            Mock.Random.pick(["酒店", "宾馆", "度假村"]),
          "type|1": ["electric", "theme", "private", "luxury"],
          images: () =>
            Array.from(
              { length: 5 },
              (_, i) =>
                `https://picsum.photos/800/600?random=${Mock.Random.integer(1, 100)}`
            ),
          coverImage: () =>
            `https://picsum.photos/400/300?random=${Mock.Random.integer(1, 100)}`,
          address: () => Mock.Random.county(true) + Mock.Random.ctitle(5, 20),
          latitude: () => latitude + Mock.Random.float(-0.1, 0.1, 1, 6),
          longitude: () => longitude + Mock.Random.float(-0.1, 0.1, 1, 6),
          distance: () => Mock.Random.float(0.1, 50, 1, 1),
          phone: () =>
            Mock.Random.pick(["010", "021", "020"]) +
            "-" +
            Mock.Random.string("number", 8),
          rating: () => Mock.Random.float(4.0, 5.0, 1, 1),
          "reviewCount|50-500": 50,
          priceRange: () => {
            const min = Mock.Random.integer(99, 299);
            const max = min + Mock.Random.integer(100, 500);
            return { min, max };
          },
          facilities: () =>
            Mock.Random.shuffle([
              "WiFi",
              "停车场",
              "餐厅",
              "健身房",
              "SPA",
              "游泳池",
              "商务中心",
              "会议室",
            ]).slice(0, Mock.Random.integer(3, 6)),
          description: () => Mock.Random.cparagraph(1, 3),
          businessHours: "24小时营业",
          "status|1": ["available", "full", "maintenance"],
          "roomCount|5-20": 5,
          "availableRooms|0-15": 5,
          "isRecommended|1": [true, false],
          tags: () =>
            Mock.Random.shuffle([
              "新开业",
              "热门",
              "高评分",
              "近地铁",
              "商圈",
              "景区周边",
            ]).slice(0, Mock.Random.integer(1, 3)),
        },
      ],
    }).list;

    // 根据关键词筛选
    let filteredHotels = hotels;
    if (keyword) {
      filteredHotels = hotels.filter(
        (hotel) =>
          hotel.name.includes(keyword) || hotel.address.includes(keyword)
      );
    }

    // 根据类型筛选
    if (type && type !== "all") {
      filteredHotels = filteredHotels.filter((hotel) => hotel.type === type);
    }

    return mockPageResponse(filteredHotels, page, pageSize);
  });

  // 获取酒店详情
  Mock.mock(/\/api\/hotels\/\d+(\?|$)/, "get", (options) => {
    console.log("Mock拦截到酒店详情请求:", options.url);
    const hotelId = parseInt(options.url.match(/\/api\/hotels\/(\d+)/)[1]);

    // 预定义几个真实的酒店名称和信息
    const hotelTemplates = [
      {
        name: "梦幻星空主题酒店",
        type: "theme",
        description:
          "酒店位于市中心繁华地段，紧邻地铁站，交通便利。酒店以星空为主题，每个房间都精心设计了独特的星空投影系统，让您仿佛置身于浩瀚宇宙之中。酒店提供24小时热水、WiFi、空调等基础设施，同时配备有专业的智能门锁系统，确保您的入住安全。",
        facilities: [
          { name: "WiFi", icon: "wifi" },
          { name: "智能门锁", icon: "safe" },
          { name: "星空投影", icon: "star" },
          { name: "免费停车位", icon: "parking" },
          { name: "电梯", icon: "elevator" },
          { name: "24小时前台", icon: "clock" },
          { name: "消毒清洁", icon: "spray" },
          { name: "空调", icon: "air-conditioning" },
        ],
      },
      {
        name: "尊享私密电竞酒店",
        type: "electric",
        description:
          "专为电竞玩家打造的高端游戏酒店，每个房间配备专业电竞设备，144Hz高刷显示器，机械键盘，电竞椅一应俱全。酒店提供千兆专线网络，延迟低至10ms以内，让您畅享游戏时光。房间隔音效果极佳，配有专业音响系统，给您最佳的游戏体验。",
        facilities: [
          { name: "电竞设备", icon: "monitor" },
          { name: "千兆专线", icon: "wifi" },
          { name: "144Hz显示器", icon: "tv" },
          { name: "隔音系统", icon: "volumeOff" },
          { name: "零食饮料", icon: "coffee" },
          { name: "免费停车位", icon: "parking" },
          { name: "消毒清洁", icon: "spray" },
          { name: "24小时营业", icon: "clock" },
        ],
      },
      {
        name: "浪漫情侣私密影院酒店",
        type: "private",
        description:
          "为情侣打造的浪漫私密空间，每个房间都配备有私人影院系统，120寸投影大屏，杜比环绕音响，海量影片资源。房间设计温馨浪漫，配有圆床、按摩浴缸、玫瑰花瓣等浪漫元素。酒店提供24小时隐私保护，让您享受专属的二人世界。",
        facilities: [
          { name: "私人影院", icon: "movie" },
          { name: "按摩浴缸", icon: "droplet" },
          { name: "圆床", icon: "bed" },
          { name: "浪漫布置", icon: "gift" },
          { name: "免费停车位", icon: "parking" },
          { name: "消毒清洁", icon: "spray" },
          { name: "隐私保护", icon: "safe" },
          { name: "迷你吧", icon: "coffee" },
        ],
      },
      {
        name: "奢华商务精品酒店",
        type: "luxury",
        description:
          "位于CBD核心商圈，酒店装修豪华典雅，融合现代科技与经典设计。房间面积宽敞，配备高端智能家居系统，可通过语音控制灯光、窗帘、空调等设备。酒店提供商务中心、会议室等设施，是商务出行的理想选择。",
        facilities: [
          { name: "智能家居", icon: "home" },
          { name: "商务中心", icon: "business" },
          { name: "SPA", icon: "spa" },
          { name: "健身房", icon: "gym" },
          { name: "免费停车位", icon: "parking" },
          { name: "消毒清洁", icon: "spray" },
          { name: "行政酒廊", icon: "coffee" },
          { name: "礼宾服务", icon: "bell" },
        ],
      },
    ];

    const template = hotelTemplates[hotelId % hotelTemplates.length];

    // 从16张真实图片中随机选择3-5张
    const imageCount = Mock.Random.integer(3, 5);
    const availableImages = Array.from(
      { length: 16 },
      (_, i) =>
        `https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/hotel${String(i + 1).padStart(2, "0")}.jpg`
    );
    const selectedImages = Mock.Random.shuffle(availableImages).slice(
      0,
      imageCount
    );

    const hotel = {
      id: hotelId,
      name: template.name,
      type: template.type,
      images: selectedImages,
      coverImage: selectedImages[0],
      address:
        Mock.Random.county(true) +
        Mock.Random.ctitle(5, 15) +
        Mock.Random.integer(1, 999) +
        "号",
      latitude: 39.9042 + Mock.Random.float(-0.05, 0.05, 1, 6),
      longitude: 116.4074 + Mock.Random.float(-0.05, 0.05, 1, 6),
      distance: Mock.Random.float(0.5, 15, 1, 1),
      phone:
        Mock.Random.pick(["010", "021", "020", "0755", "028"]) +
        "-" +
        Mock.Random.string("number", 8),
      rating: Mock.Random.float(4.5, 5.0, 1, 1),
      reviewCount: Mock.Random.integer(300, 2000),
      description: template.description,
      businessHours: "24小时营业",
      facilities: template.facilities,
      services: [
        "24小时前台",
        "行李寄存",
        "叫醒服务",
        "洗衣服务",
        "客房服务",
        "礼宾服务",
        "免费WiFi",
        "免费停车",
      ],
      policies: [
        { label: "入住时间", value: "按预订时段开始时间" },
        { label: "退房时间", value: "按预订时段结束时间" },
        { label: "取消政策", value: "入住前2小时可免费取消，逾期不可取消" },
        { label: "宠物政策", value: "不允许携带宠物入住" },
        { label: "吸烟政策", value: "全面禁烟，设有专门吸烟区" },
        { label: "发票开具", value: "可开具电子发票，请联系前台" },
        { label: "身份登记", value: "入住需提供有效身份证件" },
      ],
      location: {
        nearby: [
          {
            name: "地铁10号线",
            distance: "150米",
            type: "transport",
            icon: "subway",
          },
          { name: "公交站", distance: "50米", type: "transport", icon: "bus" },
          {
            name: "万达广场",
            distance: "600米",
            type: "shopping",
            icon: "shopping",
          },
          {
            name: "肯德基",
            distance: "200米",
            type: "food",
            icon: "restaurant",
          },
          {
            name: "便利店",
            distance: "100米",
            type: "shopping",
            icon: "store",
          },
          {
            name: "医院",
            distance: "1.5公里",
            type: "medical",
            icon: "hospital",
          },
        ],
      },
      roomCount: Mock.Random.integer(10, 30),
      availableRooms: Mock.Random.integer(5, 20),
      priceRange: {
        min: 99,
        max: 899,
      },
      tags:
        template.type === "theme"
          ? ["星空主题", "浪漫", "近地铁"]
          : template.type === "electric"
            ? ["电竞", "高配", "24小时"]
            : template.type === "private"
              ? ["情侣", "私密", "影院"]
              : ["豪华", "商务", "CBD核心"],
    };

    return mockResponse(hotel);
  });

  // 获取酒店房型列表
  Mock.mock(/\/api\/hotels\/\d+\/rooms(\?|$)/, "get", (options) => {
    console.log("Mock拦截到房间列表请求:", options.url);
    const hotelId = options.url.match(/\/api\/hotels\/(\d+)\/rooms/)[1];
    const url = new URL("http://localhost" + options.url);
    const checkIn = url.searchParams.get("checkIn");
    const checkOut = url.searchParams.get("checkOut");

    // 从6张真实房间图片中随机分配
    const roomImages = [
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room01.jpg",
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room02.jpg",
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room03.jpg",
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room04.jpg",
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room05.jpg",
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room06.jpg",
    ];

    const roomTemplatesList = [
      {
        name: "星河璀璨大床房",
        area: 25,
        bedType: "2.0米大床",
        price: 199,
        tag: "热门",
        displayFeatures: ["星空投影", "蓝牙音响", "氛围灯光"],
      },
      {
        name: "梦幻星空双床房",
        area: 30,
        bedType: "1.5米双床",
        price: 229,
        tag: null,
        displayFeatures: ["双星空投影", "智能窗帘", "干湿分离"],
      },
      {
        name: "尊享电竞单人间",
        area: 20,
        bedType: "1.5米单人床",
        price: 299,
        tag: "新品",
        displayFeatures: ["顶配主机", "144Hz显示器", "机械键盘"],
      },
      {
        name: "双人开黑电竞房",
        area: 35,
        bedType: "双人电竞位",
        price: 428,
        tag: "热门",
        displayFeatures: ["双电竞设备", "千兆专线", "免费零食"],
      },
      {
        name: "浪漫情侣影音套房",
        area: 40,
        bedType: "2.2米圆床",
        price: 358,
        tag: "推荐",
        displayFeatures: ["私人影院", "智能灯光", "按摩浴缸"],
      },
      {
        name: "豪华家庭套房",
        area: 55,
        bedType: "大床+双床",
        price: 498,
        tag: null,
        displayFeatures: ["两室一厅", "独立厨房", "儿童设施"],
      },
      {
        name: "商务行政套房",
        area: 45,
        bedType: "2.0米大床",
        price: 388,
        tag: null,
        displayFeatures: ["办公区域", "会客厅", "行政酒廊"],
      },
    ];

    const rooms = roomTemplatesList.map((template, index) => ({
      id: index + 1,
      hotelId: parseInt(hotelId),
      name: template.name,
      image: roomImages[index % roomImages.length],
      area: template.area,
      bedType: template.bedType,
      price: template.price,
      tag: template.tag,
      displayFeatures: template.displayFeatures,
      originalPrice: template.price + Mock.Random.integer(50, 150),
      memberPrice: Math.floor(template.price * 0.9),
      availableRooms: Mock.Random.integer(1, 5),
      features: Mock.Random.shuffle([
        "免费WiFi",
        "24小时热水",
        "空调",
        "暖气",
        "电视",
        "冰箱",
        "保险箱",
        "吹风机",
        "浴缸",
        "淋浴",
        "阳台",
        "市景",
      ]).slice(0, Mock.Random.integer(6, 10)),
      description: Mock.Random.cparagraph(1, 2),
      cancellation: "free",
      breakfast: Mock.Random.boolean(),
    }));

    return mockResponse(rooms);
  });

  // 获取房间详情
  Mock.mock(/\/api\/hotels\/\d+\/rooms\/\d+(\?|$)/, "get", (options) => {
    console.log("Mock拦截到房间详情请求:", options.url);
    const hotelId = parseInt(
      options.url.match(/\/api\/hotels\/(\d+)\/rooms\/(\d+)/)[1]
    );
    const roomId = parseInt(
      options.url.match(/\/api\/hotels\/(\d+)\/rooms\/(\d+)/)[2]
    );
    console.log("解析得到 hotelId:", hotelId, "roomId:", roomId);

    // 根据酒店类型预定义房间模板
    const roomTemplates = {
      theme: [
        // 主题酒店房间
        {
          name: "星河璀璨大床房",
          description:
            "25平米温馨空间，配备2米大床和星空投影系统。房间采用深色调装修，营造浪漫氛围。智能控制系统可调节星空效果，让您在繁星点点中入眠。配备蓝牙音响，可播放舒缓音乐。",
          area: 25,
          bedType: "2.0米大床",
          price: 199,
          features: [
            { name: "星空投影", icon: "star", description: "可调节星空效果" },
            { name: "蓝牙音响", icon: "music", description: "JBL专业音响" },
            { name: "氛围灯光", icon: "light", description: "多种灯光模式" },
            { name: "免费WiFi", icon: "wifi", description: "千兆光纤" },
            { name: "24小时热水", icon: "water", description: "恒温热水系统" },
            { name: "智能空调", icon: "air", description: "智能温控" },
          ],
        },
        {
          name: "梦幻星空双床房",
          description:
            "30平米舒适空间，配备两张1.5米床和双星空投影系统。适合朋友、同事一起入住。房间配备独立卫浴，干湿分离设计。智能窗帘可根据时间自动调节，给您最舒适的体验。",
          area: 30,
          bedType: "1.5米双床",
          price: 229,
          features: [
            { name: "双星空投影", icon: "star", description: "独立控制" },
            { name: "智能窗帘", icon: "curtain", description: "自动调节" },
            { name: "干湿分离", icon: "bathroom", description: "独立淋浴间" },
            { name: "免费WiFi", icon: "wifi", description: "千兆光纤" },
            { name: "办公桌", icon: "desk", description: "商务办公" },
            { name: "智能电视", icon: "tv", description: "55寸4K" },
          ],
        },
      ],
      electric: [
        // 电竞酒店房间
        {
          name: "尊享电竞单人间",
          description:
            "20平米专业电竞空间，配备RTX4090显卡+i9-13900K处理器的顶级电竞主机。27寸144Hz专业电竞显示器，机械键盘，电竞鼠标，电竞椅一应俱全。千兆电竞专线，延迟低至5ms。房间隔音效果极佳，让您尽情享受游戏时光。",
          area: 20,
          bedType: "1.5米单人床",
          price: 299,
          features: [
            {
              name: "顶配主机",
              icon: "monitor",
              description: "RTX4090+i9-13900K",
            },
            { name: "电竞显示器", icon: "monitor", description: "27寸144Hz" },
            { name: "机械键盘", icon: "keyboard", description: "青轴机械键盘" },
            { name: "电竞椅", icon: "chair", description: "人体工学电竞椅" },
            { name: "千兆专线", icon: "wifi", description: "超低延迟" },
            { name: "专业隔音", icon: "volumeSlash", description: "互不打扰" },
          ],
        },
        {
          name: "双人开黑电竞房",
          description:
            "35平米超大电竞空间，配备两套完全相同的顶级电竞设备。支持双人联机开黑，配备专业语音系统。房间提供免费能量饮料和零食补给，让您畅玩不停。24小时营业，随时入住。",
          area: 35,
          bedType: "两张1.5米床",
          price: 499,
          features: [
            {
              name: "双主机配置",
              icon: "monitor",
              description: "两套顶配设备",
            },
            { name: "语音系统", icon: "microphone", description: "专业麦克风" },
            { name: "能量补给", icon: "food", description: "免费饮料零食" },
            { name: "24小时营业", icon: "clock", description: "随时入住" },
            { name: "千兆专线", icon: "wifi", description: "双线路保障" },
            { name: "按摩椅", icon: "armchair", description: "休息放松" },
          ],
        },
      ],
      private: [
        // 私密影院房间
        {
          name: "浪漫圆床影院房",
          description:
            "28平米浪漫私密空间，配备2.2米圆形大床和120寸投影大屏。杜比环绕音响系统，海量高清影片资源。房间提供玫瑰花瓣、香薰蜡烛等浪漫布置。按摩浴缸可容纳两人，享受私密时光。",
          area: 28,
          bedType: "2.2米圆床",
          price: 399,
          features: [
            { name: "私人影院", icon: "movie", description: "120寸投影" },
            { name: "杜比音效", icon: "volume", description: "环绕立体声" },
            { name: "按摩浴缸", icon: "bath", description: "双人按摩浴缸" },
            { name: "浪漫布置", icon: "heart", description: "玫瑰花瓣香薰" },
            { name: "隐私保护", icon: "privacy", description: "24小时守护" },
            { name: "迷你吧", icon: "bar", description: "免费零食饮料" },
          ],
        },
        {
          name: "奢华套房影院",
          description:
            "45平米超大套房，独立客厅和卧室设计。客厅配备150寸投影和专业家庭影院音响系统。卧室配备2.4米超大圆床。独立卫生间配有智能马桶和大理石浴缸。提供红酒、鲜花等高端服务。",
          area: 45,
          bedType: "2.4米超大圆床",
          price: 699,
          features: [
            { name: "150寸巨幕", icon: "movie", description: "影院级体验" },
            { name: "家庭影院", icon: "volumeSlash", description: "BOSE音响" },
            { name: "独立客厅", icon: "room", description: "超大空间" },
            { name: "智能马桶", icon: "toilet", description: "日本进口" },
            { name: "红酒鲜花", icon: "wine", description: "高端服务" },
            { name: "专属管家", icon: "service", description: "24小时服务" },
          ],
        },
      ],
      luxury: [
        // 豪华商务房间
        {
          name: "商务精英大床房",
          description:
            "35平米现代商务空间，配备2.0米舒适大床和独立办公区。智能家居系统支持语音控制灯光、窗帘、空调等设备。房间配备Nespresso咖啡机、迷你吧。独立淋浴间和浴缸。",
          area: 35,
          bedType: "2.0米大床",
          price: 599,
          features: [
            { name: "智能家居", icon: "smart", description: "语音控制" },
            { name: "Nespresso", icon: "coffee", description: "胶囊咖啡机" },
            { name: "独立办公区", icon: "desk", description: "人体工学座椅" },
            { name: "迷你吧", icon: "bar", description: "免费饮品" },
            { name: "浴缸淋浴", icon: "bath", description: "干湿分离" },
            { name: "高速网络", icon: "wifi", description: "千兆光纤" },
          ],
        },
        {
          name: "行政套房",
          description:
            "60平米奢华套房，独立客厅、卧室、书房三分离设计。客厅配备真皮沙发和65寸智能电视。卧室配备2.2米kingsize大床和步入式衣帽间。书房配备大班台办公桌。可使用行政酒廊。",
          area: 60,
          bedType: "2.2米kingsize",
          price: 899,
          features: [
            { name: "三分离设计", icon: "room", description: "客厅卧室书房" },
            {
              name: "步入式衣帽间",
              icon: "wardrobe",
              description: "超大储物空间",
            },
            { name: "行政酒廊", icon: "coffee", description: "免费茶点" },
            { name: "大班台", icon: "desk", description: "实木办公桌" },
            { name: "SPA浴缸", icon: "bath", description: "按摩浴缸" },
            { name: "管家服务", icon: "bell", description: "专属管家" },
          ],
        },
      ],
    };

    // 获取对应酒店类型
    const hotelType = ["theme", "electric", "private", "luxury"][hotelId % 4];
    const templates = roomTemplates[hotelType];
    const template = templates[roomId % templates.length];

    // 从6张真实房间图片中随机选择3-5张
    const roomImages = [
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room01.jpg",
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room02.jpg",
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room03.jpg",
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room04.jpg",
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room05.jpg",
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room06.jpg",
    ];
    const imageCount = Mock.Random.integer(3, 5);
    const selectedImages = Mock.Random.shuffle(roomImages).slice(0, imageCount);

    const room = {
      id: roomId,
      hotelId: hotelId,
      name: template.name,
      image: selectedImages[0],
      images: selectedImages,
      area: template.area,
      bedType: template.bedType,
      maxGuests: template.bedType.includes("双床") ? 2 : 1,
      price: template.price,
      originalPrice: template.price + 50,
      memberPrice: Math.floor(template.price * 0.9),
      availableRooms: Mock.Random.integer(1, 8),
      description: template.description,
      features: template.features,
      amenities: [
        "免费洗漱用品",
        "一次性拖鞋",
        "浴巾毛巾",
        "吹风机",
        "电热水壶",
        "矿泉水",
        "一次性杯具",
        "衣架",
      ],
      policies: {
        cancellation: "免费取消（入住前2小时）",
        breakfast: false,
        smoking: hotelType === "private",
        extraBed: template.area > 30 ? "可加床，需额外收费100元" : "不支持加床",
        deposit: "无需押金",
        idCard: "需出示有效身份证件",
      },
      detailContent: `
        <div style="line-height: 0;">
          <img src="https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/content01.jpg" style="width: 100%; height: auto; display: block;" />
          <img src="https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/content02.jpg" style="width: 100%; height: auto; display: block;" />
          <img src="https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/content03.jpg" style="width: 100%; height: auto; display: block;" />
          <img src="https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/content04.jpg" style="width: 100%; height: auto; display: block;" />
          <img src="https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/content05.jpg" style="width: 100%; height: auto; display: block;" />
          <img src="https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/content06.jpg" style="width: 100%; height: auto; display: block;" />
          <img src="https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/content07.jpg" style="width: 100%; height: auto; display: block;" />
          <img src="https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/content08.jpg" style="width: 100%; height: auto; display: block;" />
        </div>
      `,
    };

    return mockResponse(room);
  });

  // 获取酒店评价
  Mock.mock(/\/api\/hotels\/\d+\/reviews(\?|$)/, "get", (options) => {
    console.log("Mock拦截到评价列表请求:", options.url);
    const hotelId = parseInt(
      options.url.match(/\/api\/hotels\/(\d+)\/reviews/)[1]
    );
    const url = new URL("http://localhost" + options.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const pageSize = parseInt(url.searchParams.get("pageSize")) || 10;

    // 根据酒店类型定义评价模板
    const hotelType = ["theme", "electric", "private", "luxury"][hotelId % 4];

    const reviewTemplates = {
      theme: [
        {
          rating: 5,
          content:
            "星空投影真的太浪漫了！晚上躺在床上看着满天繁星，感觉特别放松。房间很干净，设施也很新，服务态度也很好，下次还会来！",
          hasImage: true,
        },
        {
          rating: 5,
          content:
            "第一次体验星空主题房，效果比想象中还要好！音响音质也很棒，播放了一晚上轻音乐。位置也方便，就在地铁口附近。强烈推荐！",
          hasImage: false,
        },
        {
          rating: 4,
          content:
            "整体体验不错，星空效果很赞，就是隔音稍微差了一点点，能听到隔壁走廊的声音。其他方面都挺满意的，性价比高。",
          hasImage: true,
        },
        {
          rating: 5,
          content:
            "跟女朋友来的，她特别喜欢！拍了好多照片。房间温馨干净，热水很足，WiFi速度也快。老板还送了小零食，很贴心。",
          hasImage: true,
        },
        {
          rating: 4,
          content:
            "星空投影系统很智能，可以调节亮度和颜色。床也很舒服，睡得很好。就是房间稍微小了点，但一个人住完全够用。",
          hasImage: false,
        },
      ],
      electric: [
        {
          rating: 5,
          content:
            "电竞设备真的顶！RTX4090显卡玩游戏完全不卡，144Hz显示器体验超级流畅。网速也给力，延迟才5ms。玩了一整夜，太爽了！",
          hasImage: true,
        },
        {
          rating: 5,
          content:
            "机械键盘手感很棒，电竞椅坐着也舒服。房间隔音效果很好，可以尽情语音开黑不怕吵到别人。还有免费的能量饮料，太贴心了！",
          hasImage: true,
        },
        {
          rating: 5,
          content:
            "和朋友一起来开黑，两台电脑配置一模一样，体验完美！语音系统也很专业。玩累了还有按摩椅可以放松，真的是电竞玩家的天堂！",
          hasImage: false,
        },
        {
          rating: 4,
          content:
            "设备配置确实高，游戏体验很好。就是键盘是青轴的，声音有点大，不过玩游戏正合适。网络稳定，没掉过线，很满意。",
          hasImage: true,
        },
        {
          rating: 5,
          content:
            "24小时营业真的方便，半夜想玩游戏随时都能来。房间设施齐全，床虽然不大但很舒服。老板是个游戏迷，聊得很投机哈哈。",
          hasImage: false,
        },
      ],
      private: [
        {
          rating: 5,
          content:
            "120寸投影看电影太震撼了！音响效果也特别好，真的像在电影院一样。按摩浴缸很大，两个人一起泡很舒服。房间布置很浪漫，女朋友很满意！",
          hasImage: true,
        },
        {
          rating: 5,
          content:
            "圆床好大好舒服！投影仪资源很多，看了一整晚电影。隐私性很好，完全不用担心被打扰。玫瑰花瓣和香薰蜡烛都准备好了，太贴心了！",
          hasImage: true,
        },
        {
          rating: 4,
          content:
            "影院系统很棒，片源很丰富。就是房间稍微暗了点，不过既然是私密影院房，这样的氛围也挺好的。整体体验不错，值得推荐。",
          hasImage: false,
        },
        {
          rating: 5,
          content:
            "套房空间超大！客厅和卧室分开，投影设备是专业级别的，音响是BOSE的。还送了红酒，真的很有仪式感。纪念日来住太合适了！",
          hasImage: true,
        },
        {
          rating: 5,
          content:
            "私密性做得很好，从进门到退房都很注重隐私保护。智能马桶、按摩浴缸都是高端配置。迷你吧的零食饮料都是免费的，良心！",
          hasImage: true,
        },
      ],
      luxury: [
        {
          rating: 5,
          content:
            "商务出差首选！房间宽敞明亮，办公区域设计合理。智能家居系统很方便，语音控制很灵敏。Nespresso咖啡机很赞，早上来杯咖啡精神一整天。",
          hasImage: false,
        },
        {
          rating: 5,
          content:
            "套房太奢华了！客厅、卧室、书房三分离，空间超大。步入式衣帽间特别实用。可以用行政酒廊，免费的茶点很丰富。管家服务也很专业。",
          hasImage: true,
        },
        {
          rating: 4,
          content:
            "整体很满意，房间设施齐全，床品质量很好睡得很舒服。就是价格稍微贵了点，不过一分钱一分货，商务接待很有面子。",
          hasImage: false,
        },
        {
          rating: 5,
          content:
            "智能家居体验太好了！窗帘、灯光、空调都能语音控制。浴缸是按摩的，泡澡很舒服。位置在CBD核心，周边配套齐全，很方便。",
          hasImage: true,
        },
        {
          rating: 5,
          content:
            "行政套房真的值这个价！大班台办公桌很气派，开视频会议很专业。迷你吧饮品都是免费的。SPA浴缸太享受了，出差也能好好放松。",
          hasImage: true,
        },
      ],
    };

    const templates = reviewTemplates[hotelType];

    const reviews = Array.from({ length: 50 }, (_, index) => {
      const template = templates[index % templates.length];
      const createTime = new Date(
        Date.now() - Mock.Random.integer(1, 180) * 86400000
      ); // 1-180天前
      const roomType = {
        theme: Mock.Random.pick(["星河璀璨大床房", "梦幻星空双床房"]),
        electric: Mock.Random.pick(["尊享电竞单人间", "双人开黑电竞房"]),
        private: Mock.Random.pick(["浪漫圆床影院房", "奢华套房影院"]),
        luxury: Mock.Random.pick(["商务精英大床房", "行政套房"]),
      }[hotelType];

      // 商家回复内容模板
      const replyTemplates = [
        "感谢您的宝贵意见和五星好评！我们会继续保持高标准的服务质量，期待您的再次光临！",
        "非常感谢您的认可与支持！我们会继续努力，为您提供更优质的服务体验。",
        "感谢您的反馈，我们已记录您的宝贵建议，会持续改进。期待下次为您服务！",
        "谢谢您的好评！能让您满意是我们最大的动力，欢迎常来！",
        "感谢您的支持！我们会继续提升服务品质，为每一位客人创造美好回忆。",
      ];

      return {
        id: index + 1,
        userId: Mock.Random.integer(10000, 99999),
        userName: Mock.Random.cname(),
        avatar: `https://picsum.photos/100/100?user=${index}`,
        userLevel: Mock.Random.pick([
          "普通会员",
          "VIP会员",
          "黄金会员",
          "钻石会员",
        ]),
        rating: template.rating,
        content: template.content,
        images: template.hasImage
          ? Array.from(
              { length: Mock.Random.integer(1, 4) },
              (_, i) => `https://picsum.photos/400/300?review=${index}&img=${i}`
            )
          : [],
        tags:
          template.rating >= 5
            ? Mock.Random.shuffle([
                "值得推荐",
                "还会再来",
                "性价比高",
                "服务好",
              ]).slice(0, 2)
            : template.rating >= 4
              ? ["还不错"]
              : [],
        date: createTime
          .toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })
          .replace(/\//g, "-"),
        roomType: roomType,
        helpful: Mock.Random.integer(0, 30),
        isHelpful: false,
        reply:
          Mock.Random.boolean() && index < 15
            ? Mock.Random.pick(replyTemplates)
            : null,
      };
    });

    return mockPageResponse(reviews, page, pageSize);
  });

  // 预订房间
  Mock.mock(/\/api\/hotels\/\d+\/rooms\/\d+\/book/, "post", (options) => {
    const body = JSON.parse(options.body);

    const order = Mock.mock({
      orderId:
        Mock.Random.string("upper", 2) +
        Mock.Random.datetime("yyyyMMddHHmmss") +
        Mock.Random.integer(100, 999),
      hotelId: body.hotelId,
      roomId: body.roomId,
      checkInTime: body.checkInTime,
      duration: body.duration,
      guestInfo: body.guestInfo,
      totalPrice: body.totalPrice,
      status: "pending",
      paymentDeadline: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
      createTime: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
    });

    return mockResponse(order, "预订成功，请在30分钟内完成支付");
  });

  // 获取房间时段列表
  Mock.mock(/\/api\/hotels\/\d+\/rooms\/\d+\/timeslots/, "get", (options) => {
    console.log("Mock拦截到时段列表请求:", options.url);

    // 提取参数
    const match = options.url.match(
      /\/api\/hotels\/(\d+)\/rooms\/(\d+)\/timeslots/
    );
    if (!match) {
      console.error("URL匹配失败:", options.url);
      return mockResponse([]);
    }

    const hotelId = parseInt(match[1]);
    const roomId = parseInt(match[2]);
    console.log("解析得到 hotelId:", hotelId, "roomId:", roomId);

    const url = new URL("http://localhost" + options.url);
    const date = url.searchParams.get("date");
    console.log("查询日期:", date);

    // 定义标准时段模板
    const timeSlotTemplates = [
      {
        id: "slot-1",
        startTime: "09:00",
        endTime: "12:00",
        duration: 3,
        name: "上午时段",
        description: "适合短暂休息，放松身心",
        discount: 0.8,
      },
      {
        id: "slot-2",
        startTime: "12:00",
        endTime: "15:00",
        duration: 3,
        name: "午间时段",
        description: "午休时光，恢复精力",
        discount: 0.85,
      },
      {
        id: "slot-3",
        startTime: "14:00",
        endTime: "18:00",
        duration: 4,
        name: "下午时段",
        description: "黄金时段，舒适体验",
        discount: 1.0,
      },
      {
        id: "slot-4",
        startTime: "18:00",
        endTime: "22:00",
        duration: 4,
        name: "晚间时段",
        description: "热门时段，享受夜晚",
        discount: 1.2,
      },
      {
        id: "slot-5",
        startTime: "22:00",
        endTime: "06:00",
        duration: 8,
        name: "过夜时段",
        description: "整夜休息，充分放松",
        discount: 1.5,
      },
      {
        id: "slot-6",
        startTime: "00:00",
        endTime: "24:00",
        duration: 24,
        name: "全天时段",
        description: "全天入住，物超所值",
        discount: 2.0,
      },
    ];

    // 根据房间ID确定基础价格
    const basePrice = [199, 229, 299, 499, 399, 699, 599, 899][roomId % 8];

    // 生成时段列表，某些时段随机设为不可用
    const timeSlots = timeSlotTemplates.map((template, index) => {
      const price = Math.floor(basePrice * template.discount);
      // 全天时段和过夜时段较少可用（前4个时段总是可用，后2个70%概率可用）
      const isAvailable = index < 4 || Math.random() < 0.7;

      return {
        id: template.id,
        startTime: template.startTime,
        endTime: template.endTime,
        duration: template.duration,
        name: template.name,
        description: template.description,
        price: price,
        originalPrice: price + 20,
        available: isAvailable,
        remainingRooms: isAvailable ? Mock.Random.integer(1, 5) : 0,
        tags: index >= 3 ? ["热门"] : [],
      };
    });

    console.log("生成的时段列表:", timeSlots);
    console.log("时段列表长度:", timeSlots.length);

    const result = mockResponse(timeSlots);
    console.log("返回的响应:", result);
    return result;
  });

  // 获取订单详情
  Mock.mock(/\/api\/orders\/\w+/, "get", (options) => {
    const orderId = options.url.match(/\/api\/orders\/(\w+)/)[1];

    // 订单状态：pending-待支付, paid-已支付, checked_in-已入住, completed-已完成, cancelled-已取消, refunded-已退款
    const status = Mock.Random.pick([
      "paid",
      "paid",
      "checked_in",
      "completed",
      "cancelled",
    ]);

    const hotelNames = [
      "梦幻星空主题酒店",
      "尊享私密电竞酒店",
      "浪漫情侣私密影院酒店",
      "奢华商务精品酒店",
    ];
    const roomNames = {
      梦幻星空主题酒店: ["星河璀璨大床房", "梦幻星空双床房"],
      尊享私密电竞酒店: ["尊享电竞单人间", "双人开黑电竞房"],
      浪漫情侣私密影院酒店: ["浪漫圆床影院房", "奢华套房影院"],
      奢华商务精品酒店: ["商务精英大床房", "行政套房"],
    };

    const hotelName = Mock.Random.pick(hotelNames);
    const roomName = Mock.Random.pick(roomNames[hotelName]);

    // 真实的房间图片
    const roomImages = [
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room01.jpg",
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room02.jpg",
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room03.jpg",
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room04.jpg",
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room05.jpg",
      "https://fuguanjia.oss-cn-beijing.aliyuncs.com/images/room06.jpg",
    ];

    const timeSlots = [
      { start: "09:00", end: "12:00", duration: 3 },
      { start: "12:00", end: "15:00", duration: 3 },
      { start: "14:00", end: "18:00", duration: 4 },
      { start: "18:00", end: "22:00", duration: 4 },
      { start: "22:00", end: "06:00", duration: 8 },
    ];
    const slot = Mock.Random.pick(timeSlots);

    const roomPrice = Mock.Random.pick([
      199, 229, 299, 399, 499, 599, 699, 899,
    ]);
    const discount = Mock.Random.integer(0, 50);

    // 生成真实的时间戳
    const createTime = new Date(
      Date.now() - Mock.Random.integer(1, 72) * 3600000
    ); // 1-72小时前
    const payTime =
      status !== "cancelled"
        ? new Date(createTime.getTime() + Mock.Random.integer(5, 30) * 60000)
        : null; // 支付时间在创建后5-30分钟

    const order = {
      orderId: orderId,
      orderNo:
        "HT" +
        Mock.Random.datetime("yyyyMMddHHmmss") +
        Mock.Random.integer(100, 999),
      status: status,
      statusText: {
        pending: "待支付",
        paid: "已支付",
        checked_in: "已入住",
        completed: "已完成",
        cancelled: "已取消",
        refunded: "已退款",
      }[status],
      hotelId: Mock.Random.integer(1, 10),
      hotelName: hotelName,
      hotelAddress:
        Mock.Random.county(true) +
        Mock.Random.ctitle(5, 12) +
        Mock.Random.integer(1, 999) +
        "号",
      hotelPhone:
        Mock.Random.pick(["010", "021", "020", "0755"]) +
        "-" +
        Mock.Random.string("number", 8),
      roomId: Mock.Random.integer(1, 20),
      roomName: roomName,
      roomImage: Mock.Random.pick(roomImages),
      roomArea: roomName.includes("套房")
        ? Mock.Random.integer(45, 60)
        : Mock.Random.integer(20, 35),
      bedType: roomName.includes("双床")
        ? "1.5米双床"
        : roomName.includes("单人")
          ? "1.5米单人床"
          : "2.0米大床",
      bookingDate: Mock.Random.date("yyyy-MM-dd"),
      startTime: slot.start,
      endTime: slot.end,
      duration: slot.duration,
      timeSlotName:
        slot.duration >= 8
          ? "过夜时段"
          : slot.duration >= 4
            ? slot.start >= "18:00"
              ? "晚间时段"
              : "下午时段"
            : "上午时段",
      contactName: Mock.Random.cname(),
      contactPhone: "1" + Mock.Random.string("number", 10),
      roomPrice: roomPrice,
      discount: discount,
      totalPrice: roomPrice - discount,
      paymentMethod: Mock.Random.pick(["balance", "wechat", "alipay"]),
      paymentMethodText: Mock.Random.pick([
        "余额支付",
        "微信支付",
        "支付宝支付",
      ]),
      createTime: createTime
        .toLocaleString("zh-CN", { hour12: false })
        .replace(/\//g, "-"),
      payTime: payTime
        ? payTime.toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-")
        : null,
      unlockCode:
        status === "paid" || status === "checked_in"
          ? Mock.Random.string("number", 6)
          : null,
      qrCode:
        status === "paid" || status === "checked_in"
          ? `UNLOCK_${orderId}_${Mock.Random.string("number", 8)}`
          : null,
      canCancel: status === "paid",
      canRefund: status === "paid" || status === "checked_in",
      canUnlock: status === "paid" || status === "checked_in",
      refundAmount:
        status === "refunded"
          ? roomPrice - discount - Mock.Random.integer(0, 50)
          : null,
      cancelReason:
        status === "cancelled"
          ? Mock.Random.pick(["用户取消", "超时未支付"])
          : null,
      remark: "",
    };

    return mockResponse(order);
  });

  // 取消订单
  Mock.mock(/\/api\/orders\/\w+\/cancel/, "post", (options) => {
    return mockResponse({}, "订单已取消");
  });

  // 获取设备信息
  Mock.mock(/\/api\/devices\/\w+/, "get", (options) => {
    const deviceId = options.url.match(/\/api\/devices\/(\w+)/)[1];

    const device = Mock.mock({
      deviceId: deviceId,
      name: Mock.Random.pick(["1号柜", "2号柜", "3号柜", "A区1号", "B区2号"]),
      location: Mock.Random.ctitle(3, 10) + "房间",
      "status|1": ["locked", "unlocked", "offline"],
      battery: Mock.Random.integer(20, 100),
      signal: Mock.Random.integer(60, 100),
    });

    return mockResponse(device);
  });

  // 设备开锁
  Mock.mock(/\/api\/devices\/unlock/, "post", (options) => {
    const body = JSON.parse(options.body);

    // 模拟开锁成功率（90%）
    const success = Mock.Random.boolean(9, 1, true);

    if (success) {
      return mockResponse({
        success: true,
        message: "开锁成功",
        unlockTime: Mock.Random.datetime("yyyy-MM-dd HH:mm:ss"),
      });
    } else {
      return {
        code: 500,
        message: "开锁失败，请检查设备状态或联系客服",
        data: null,
      };
    }
  });
}
