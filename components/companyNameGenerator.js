const _ = require('lodash');

const names = ['饭', '辰', '浸', '真', '游', '尼', '征', '的', '挤', '郎', '夜', '违', '应', '微', '糖', '蠢', '烟', '催', '迟', '架', '辫', '怀', '衫', '逐', '您', '块', '堡', '古', '锣', '飘', '雾', '剥', '钳', '至', '浓', '芒', '元', '夏', '敏', '县', '感', '松', '拒', '阴', '躲', '裂', '行', '庆', '接', '肥', '笋', '默', '敞', '秀', '兼', '姜', '究', '博', '乎', '疯', '盲', '谱', '坡', '全', '熟', '孕', '齐', '拆', '特', '央', '瘦', '怖', '订', '积', '冶', '膝', '述', '习', '王', '赤', '湿', '云', '况', '深', '驱', '抽', '菜', '斧', '辛', '粉', '侦', '耀', '墙', '滚', '泊', '项', '龙', '透', '皂', '诱'];

const suffix = ['科技', '技术', '传媒', '文化', '网络', '艺术', '培训'];

function generate(){
    return '上海' + _.sample(names) + _.sample(names) + _.sample(suffix) + '有限公司';
}

module.exports = {
    generate
};
