import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { parseM3U, fetchM3UFromUrl } from '@/utils/m3uParser';

interface Stream {
  id: string;
  name: string;
  category: string;
  url: string;
  logo?: string;
  country?: string;
}

interface PlaylistUploaderProps {
  onStreamsLoaded: (streams: Stream[]) => void;
}

const PlaylistUploader = ({ onStreamsLoaded }: PlaylistUploaderProps) => {
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const text = await file.text();
      const streams = parseM3U(text);
      
      if (streams.length === 0) {
        setError('Не удалось найти потоки в файле');
        return;
      }
      
      onStreamsLoaded(streams);
    } catch (err) {
      setError('Ошибка при чтении файла');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlLoad = async () => {
    if (!urlInput.trim()) {
      setError('Введите URL плейлиста');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const streams = await fetchM3UFromUrl(urlInput);
      
      if (streams.length === 0) {
        setError('Не удалось найти потоки в плейлисте');
        return;
      }
      
      onStreamsLoaded(streams);
      setUrlInput('');
    } catch (err) {
      setError('Не удалось загрузить плейлист по URL');
    } finally {
      setLoading(false);
    }
  };

  const handleTextParse = () => {
    if (!textInput.trim()) {
      setError('Вставьте содержимое плейлиста');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const streams = parseM3U(textInput);
      
      if (streams.length === 0) {
        setError('Не удалось распознать потоки');
        return;
      }
      
      onStreamsLoaded(streams);
      setTextInput('');
    } catch (err) {
      setError('Ошибка при парсинге текста');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Upload" size={24} />
          Загрузить плейлист
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="file">
              <Icon name="FileUp" size={16} className="mr-2" />
              Файл
            </TabsTrigger>
            <TabsTrigger value="url">
              <Icon name="Link" size={16} className="mr-2" />
              URL
            </TabsTrigger>
            <TabsTrigger value="text">
              <Icon name="FileText" size={16} className="mr-2" />
              Текст
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <Icon name="Upload" size={48} className="mx-auto text-muted-foreground mb-4" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-sm text-muted-foreground">
                  Перетащите .m3u файл или нажмите для выбора
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".m3u,.m3u8"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-3">
              <Input
                type="url"
                placeholder="https://example.com/playlist.m3u"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={loading}
              />
              <Button 
                onClick={handleUrlLoad} 
                disabled={loading || !urlInput.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="Download" size={16} className="mr-2" />
                    Загрузить
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-3">
              <Textarea
                placeholder="#EXTM3U&#10;#EXTINF:-1,Канал 1&#10;http://example.com/stream.m3u8"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={loading}
                rows={8}
              />
              <Button 
                onClick={handleTextParse} 
                disabled={loading || !textInput.trim()}
                className="w-full"
              >
                <Icon name="Check" size={16} className="mr-2" />
                Распарсить
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
            <Icon name="AlertCircle" size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistUploader;
