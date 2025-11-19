import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import VideoPlayer from '@/components/VideoPlayer';
import PlaylistUploader from '@/components/PlaylistUploader';

interface Stream {
  id: string;
  name: string;
  category: string;
  url: string;
  logo?: string;
  country?: string;
}

const defaultCategories = ['Все', 'ТВ', 'Радио', 'Спорт', 'Музыка', 'Документальные', 'Разное'];

const Index = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>(['Все']);
    streams.forEach(stream => uniqueCategories.add(stream.category));
    return Array.from(uniqueCategories);
  }, [streams]);

  const filteredStreams = streams.filter(stream => {
    const matchesSearch = stream.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || stream.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const playStream = (id: string) => {
    const stream = streams.find(s => s.id === id);
    if (stream) {
      setCurrentStream(stream);
      if (!history.includes(id)) {
        setHistory(prev => [id, ...prev].slice(0, 20));
      }
    }
  };

  const handleStreamsLoaded = (loadedStreams: Stream[]) => {
    setStreams(loadedStreams);
    setSelectedCategory('Все');
  };

  const favoriteStreams = streams.filter(s => favorites.includes(s.id));
  const historyStreams = history.map(id => streams.find(s => s.id === id)).filter(Boolean) as Stream[];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            M3U Поисковик
          </h1>
          <p className="text-muted-foreground">Найдите любимые ТВ и радио потоки</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Icon name="Home" size={16} />
              <span className="hidden sm:inline">Главная</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Icon name="Search" size={16} />
              <span className="hidden sm:inline">Поиск</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Icon name="Layers" size={16} />
              <span className="hidden sm:inline">Категории</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Icon name="Heart" size={16} />
              <span className="hidden sm:inline">Избранное</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Icon name="Clock" size={16} />
              <span className="hidden sm:inline">История</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <PlaylistUploader onStreamsLoaded={handleStreamsLoaded} />
            
            {streams.length > 0 && (
              <>
            <div className="relative">
              <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Поиск потоков..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 text-sm hover:scale-105 transition-transform"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStreams.map(stream => (
                <Card key={stream.id} className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {stream.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {stream.category}
                          </Badge>
                          {stream.country && (
                            <span className="text-xs text-muted-foreground">{stream.country}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(stream.id);
                        }}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Icon 
                          name="Heart" 
                          size={20}
                          className={favorites.includes(stream.id) ? 'fill-red-500 text-red-500' : ''}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => playStream(stream.id)}
                        className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <Icon name="Play" size={16} />
                        Воспроизвести
                      </button>
                      <button className="p-2 border rounded-md hover:bg-secondary transition-colors">
                        <Icon name="Share2" size={16} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredStreams.length === 0 && streams.length > 0 && (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">Потоки не найдены</p>
              </div>
            )}
            </>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <div className="relative">
              <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Расширенный поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStreams.map(stream => (
                <Card key={stream.id} className="hover:shadow-lg transition-all hover:scale-[1.02]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{stream.name}</h3>
                        <Badge variant="secondary" className="text-xs">{stream.category}</Badge>
                      </div>
                      <button onClick={() => toggleFavorite(stream.id)}>
                        <Icon 
                          name="Heart" 
                          size={20}
                          className={favorites.includes(stream.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}
                        />
                      </button>
                    </div>
                    <button
                      onClick={() => playStream(stream.id)}
                      className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon name="Play" size={16} />
                      Воспроизвести
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            {categories.filter(c => c !== 'Все').map(category => {
              const categoryStreams = mockStreams.filter(s => s.category === category);
              return (
                <div key={category} className="space-y-3">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Icon name="Layers" size={24} />
                    {category}
                    <Badge variant="secondary">{categoryStreams.length}</Badge>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryStreams.map(stream => (
                      <Card key={stream.id} className="hover:shadow-lg transition-all hover:scale-[1.02]">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-lg">{stream.name}</h3>
                            <button onClick={() => toggleFavorite(stream.id)}>
                              <Icon 
                                name="Heart" 
                                size={20}
                                className={favorites.includes(stream.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}
                              />
                            </button>
                          </div>
                          <button
                            onClick={() => playStream(stream.id)}
                            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                          >
                            <Icon name="Play" size={16} />
                            Воспроизвести
                          </button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            {favoriteStreams.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Heart" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">Нет избранных потоков</p>
                <p className="text-sm text-muted-foreground mt-2">Нажмите на ❤️ чтобы добавить</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteStreams.map(stream => (
                  <Card key={stream.id} className="hover:shadow-lg transition-all hover:scale-[1.02]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{stream.name}</h3>
                          <Badge variant="secondary" className="text-xs">{stream.category}</Badge>
                        </div>
                        <button onClick={() => toggleFavorite(stream.id)}>
                          <Icon name="Heart" size={20} className="fill-red-500 text-red-500" />
                        </button>
                      </div>
                      <button
                        onClick={() => playStream(stream.id)}
                        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <Icon name="Play" size={16} />
                        Воспроизвести
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {historyStreams.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Clock" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">История пуста</p>
                <p className="text-sm text-muted-foreground mt-2">Начните воспроизведение потоков</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Недавно просмотренные</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {historyStreams.map(stream => (
                    <Card key={stream.id} className="hover:shadow-lg transition-all hover:scale-[1.02]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{stream.name}</h3>
                            <Badge variant="secondary" className="text-xs">{stream.category}</Badge>
                          </div>
                          <button onClick={() => toggleFavorite(stream.id)}>
                            <Icon 
                              name="Heart" 
                              size={20}
                              className={favorites.includes(stream.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}
                            />
                          </button>
                        </div>
                        <button
                          onClick={() => playStream(stream.id)}
                          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                          <Icon name="Play" size={16} />
                          Воспроизвести
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {currentStream && (
        <VideoPlayer
          streamUrl={currentStream.url}
          streamName={currentStream.name}
          onClose={() => setCurrentStream(null)}
        />
      )}
    </div>
  );
};

export default Index;