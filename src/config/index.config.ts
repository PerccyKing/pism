import {translate} from "@docusaurus/Translate";
import {ReactNode} from "react";
import UUID from "@site/src/components/tools/IdGenerator/Uuid";
import NanoID from "@site/src/components/tools/IdGenerator/NanoId";
import SnowflakeIDGenerator from "@site/src/components/tools/IdGenerator/SnowflakeId";
import RandomPasswordGenerator from "@site/src/components/tools/PasswordGenerate";
import passwordComplexityCalculator from "@site/src/components/tools/PasswordComplexityCalculator";
import Md5 from "@site/src/components/tools/endecryption/md5";
import SlopeCalculator from "@site/src/components/tools/building/SlopeCalculator";
import ProportionCalculator from "@site/src/components/tools/building/ProportionCalculator";
import RecipeProportion from "@site/src/components/tools/building/RecipeProportion";

export type Card = {
  id: string,
  show?: boolean | true,
  name: string,
  desc?: string,
  href: string,
  component?: () => ReactNode
}

export type CardGroup = {
  id: string,
  name: string,
  desc?: string,
  cards: Card[]
}

export const indexCard: CardGroup[] = [{
  id: 'id_gen',
  name: translate({message: 'ID生成工具'}),
  desc: translate({message: '提供多种主流ID生成方案，支持批量生成和自定义配置'}),
  cards: [
    {
      id: 'uuid',
      name: translate({message: 'UUID生成器'}),
      desc: translate({message: '生成符合RFC4122标准的UUID，支持v1/v3/v4/v5版本，可批量生成'}),
      href: '/docs/tools/id_generator/uuid',
      component: UUID,
    }, {
      id: 'nanoid',
      name: translate({message: 'NanoID生成器'}),
      desc: translate({message: '生成安全、URL友好的唯一标识符，比UUID更短且collision概率可控'}),
      href: '/docs/tools/id_generator/nanoid',
      component: NanoID,
    }, {
      id: 'snowflakeId',
      name: translate({message: '雪花ID生成器'}),
      desc: translate({message: '基于时间戳的分布式ID生成器，可自定义工作机器ID和数据中心ID'}),
      href: '/docs/tools/id_generator/snowflakeid',
      component: SnowflakeIDGenerator,
    }
  ]
}, {
  id: 'password',
  name: translate({message: '密码安全工具'}),
  desc: translate({message: '提供密码生成和强度评估功能，帮助提升账户安全性'}),
  cards: [
    {
      id: 'password',
      name: translate({message: '密码生成器'}),
      desc: translate({message: '支持自定义字符集、长度的随机密码生成，可批量生成高强度密码'}),
      href: '/docs/tools/password_generator',
      component: RandomPasswordGenerator,
    },
    {
      id: 'password_cal',
      name: translate({message: '密码强度检测器'}),
      desc: translate({message: '多维度评估密码强度，计算破解时间，提供改进建议'}),
      href: '/docs/tools/password_complexity_calculator',
      component: passwordComplexityCalculator,
    }
  ]
}, {
  id: 'encryption',
  name: translate({message: '加密工具'}),
  desc: translate({message: '提供多种常用的加密和哈希算法，支持HMAC模式，可自定义变量和参数'}),
  cards: [
    {
      id: 'md5',
      name: translate({message: 'MD5加密'}),
      desc: translate({message: '生成128位MD5哈希值，支持HMAC模式，常用于文件校验和密码存储'}),
      href: 'docs/tools/endecryption/md5',
      component: Md5,
    },
    {
      id: 'sha',
      name: translate({message: 'SHA系列加密'}),
      desc: translate({message: '支持SHA1/SHA256/SHA512等算法，提供不同安全级别的哈希计算'}),
      href: 'docs/tools/endecryption/sha',
      component: Md5,
    },
    {
      id: 'digest',
      name: translate({message: '摘要算法工具箱'}),
      desc: translate({message: '集成MD5/SHA1/SHA224/SHA256/SHA384/SHA512/SHA3/RIPEMD160等主流摘要算法，支持批量计算和结果对比'}),
      href: 'docs/tools/endecryption/digest',
      component: Md5,
    },
  ]
}, {
  id: 'building',
  name: translate({message: '家装建筑工具'}),
  desc: translate({message: '提供常用的家装建筑场景需要用到的在线工具'}),
  cards: [
    {
      id: 'slope',
      name: translate({message: '坡度计算'}),
      desc: translate({message: '通过高度长度计算夹角，通过高度夹角计算长度'}),
      href: '/docs/tools/building/slope',
    },
    {
      id: 'proportion',
      name: translate({message: '比例计算器'}),
      desc: translate({message: '多材料混合调配比例计算，如调色、水泥砂浆比例等'}),
      href: '/docs/tools/building/proportion',
    },
    {
      id: 'recipe_proportion',
      name: translate({message: '复合比例计算器'}),
      desc: translate({message: '主辅料混合计算，支持主料多组分嵌套比例'}),
      href: '/docs/tools/building/recipe_proportion',
    },
  ]
}, {
  id: 'lifestyle',
  name: translate({message: '生活与烹饪助手'}),
  desc: translate({message: '提供日常生活中常用的换算与辅助工具'}),
  cards: [
    {
      id: 'cooking_proportion',
      name: translate({message: '配料比例计算器'}),
      desc: translate({message: '烘焙与烹饪必备，支持面粉、水、酵母等各项食材的比例自动缩放计算'}),
      href: '/docs/tools/building/cooking',
    }
  ]
},{
  id: 'content_management',
  name: translate({message: '内容管理'}),
  desc: translate({message: '安全的内容管理系统'}),
  cards: [
    {
      id: 'icey',
      name: translate({message: '冰鉴'}),
      desc: translate({message: '全加密应用工具'}),
      href: '/icey',
    }
  ]
}]
