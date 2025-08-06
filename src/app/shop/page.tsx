'use client';

import { useState } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { Store, ShoppingCart, Star, Package, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'coins' | 'gems';
  category: 'cards' | 'equipment' | 'facilities' | 'special';
  rarity: 'common' | 'rare' | 'legendary';
  stock?: number;
  imageUrl?: string;
}

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [userCoins] = useState(2500);
  const [userGems] = useState(15);

  const shopItems: ShopItem[] = [
    {
      id: '1',
      name: 'ベーシックカードパック',
      description: '基本的な練習カード5枚セット',
      price: 200,
      currency: 'coins',
      category: 'cards',
      rarity: 'common',
      stock: 10
    },
    {
      id: '2',
      name: 'プレミアムカードパック',
      description: 'レア以上確定の特別カードパック',
      price: 5,
      currency: 'gems',
      category: 'cards',
      rarity: 'rare'
    },
    {
      id: '3',
      name: '新品ラケット',
      description: '選手の技術力を10%向上させる',
      price: 800,
      currency: 'coins',
      category: 'equipment',
      rarity: 'common',
      stock: 5
    },
    {
      id: '4',
      name: 'プロ仕様コート',
      description: '練習効率が25%向上する施設',
      price: 20,
      currency: 'gems',
      category: 'facilities',
      rarity: 'legendary',
      stock: 1
    },
    {
      id: '5',
      name: '特別コーチ招聘',
      description: '1ヶ月間、練習効果が2倍になる',
      price: 12,
      currency: 'gems',
      category: 'special',
      rarity: 'rare',
      stock: 3
    },
    {
      id: '6',
      name: 'エナジードリンク',
      description: '選手の体力を即座に回復',
      price: 150,
      currency: 'coins',
      category: 'equipment',
      rarity: 'common',
      stock: 20
    }
  ];

  const categories = [
    { id: 'all', label: 'すべて' },
    { id: 'cards', label: 'カード' },
    { id: 'equipment', label: '装備品' },
    { id: 'facilities', label: '施設' },
    { id: 'special', label: '特別' }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50';
      case 'rare': return 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getRarityStars = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 5;
      case 'rare': return 3;
      default: return 1;
    }
  };

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const canAfford = (item: ShopItem) => {
    const currentAmount = item.currency === 'coins' ? userCoins : userGems;
    return currentAmount >= item.price;
  };

  const cartTotal = Object.entries(cart).reduce((total, [itemId, quantity]) => {
    const item = shopItems.find(i => i.id === itemId);
    return total + (item ? item.price * quantity : 0);
  }, 0);

  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <GameLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              ショップ
            </h1>
            <p className="text-gray-600 mt-2">
              カードや装備品を購入してチームを強化しましょう
            </p>
          </div>
          
          {/* 通貨表示 */}
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm text-gray-500">コイン</div>
              <div className="text-xl font-bold text-yellow-600">{userCoins.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">ジェム</div>
              <div className="text-xl font-bold text-purple-600">{userGems}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 space-y-6">
            {/* カテゴリータブ */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 商品リスト */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className={`p-6 rounded-xl border-2 ${getRarityColor(item.rarity)}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex">
                      {Array.from({ length: getRarityStars(item.rarity) }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={`${
                            item.rarity === 'legendary' ? 'text-yellow-500' :
                            item.rarity === 'rare' ? 'text-purple-500' :
                            'text-gray-400'
                          } fill-current`}
                        />
                      ))}
                    </div>
                    
                    {item.stock && (
                      <div className="text-xs text-gray-500">
                        在庫: {item.stock}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>

                    {/* 価格 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${
                          item.currency === 'coins' ? 'text-yellow-600' : 'text-purple-600'
                        }`}>
                          {item.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.currency === 'coins' ? 'コイン' : 'ジェム'}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => addToCart(item.id)}
                        disabled={!canAfford(item) || (item.stock !== undefined && item.stock <= 0)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          canAfford(item) && (item.stock === undefined || item.stock > 0)
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        カートに追加
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ショッピングカート */}
          <div className="w-80 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingCart size={20} />
                <h2 className="text-lg font-bold">カート ({cartItemCount})</h2>
              </div>
              
              {cartItemCount === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  カートに商品がありません
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(cart).map(([itemId, quantity]) => {
                    const item = shopItems.find(i => i.id === itemId);
                    if (!item) return null;
                    
                    return (
                      <div key={itemId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500">x{quantity}</div>
                        </div>
                        <div className="text-sm font-bold">
                          {(item.price * quantity).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold">合計:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {cartTotal.toLocaleString()}
                      </span>
                    </div>
                    
                    <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                      購入する
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 日替わりセール */}
            <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-xl p-6 border-2 border-orange-300">
              <div className="flex items-center space-x-2 mb-3">
                <Store size={20} className="text-orange-600" />
                <h3 className="font-bold text-orange-800">日替わりセール</h3>
              </div>
              <div className="text-sm text-orange-700 mb-4">
                毎日新しい商品が特価で登場！
              </div>
              <button className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium flex items-center justify-center space-x-2">
                <RefreshCw size={16} />
                <span>更新まで 2:34:18</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}