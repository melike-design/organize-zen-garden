
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Moon, Sun, CheckCircle2, Circle, Calendar, Tag, StickyNote, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate: string;
  completed: boolean;
  notes: Note[];
  createdAt: string;
}

interface Note {
  id: string;
  taskId: string;
  content: string;
  createdAt: string;
}

const categories = [
  { value: 'work', label: 'İş', color: 'bg-blue-500' },
  { value: 'personal', label: 'Kişisel', color: 'bg-green-500' },
  { value: 'urgent', label: 'Acil', color: 'bg-red-500' },
  { value: 'shopping', label: 'Alışveriş', color: 'bg-purple-500' },
  { value: 'health', label: 'Sağlık', color: 'bg-orange-500' },
];

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'work',
    dueDate: '',
  });
  const [editTask, setEditTask] = useState({
    id: '',
    title: '',
    description: '',
    category: 'work',
    dueDate: '',
  });
  const [newNote, setNewNote] = useState('');

  // Load data from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    const savedTheme = localStorage.getItem('isDarkMode');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    
    if (savedTheme) {
      setIsDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Hata",
        description: "Görev başlığı gereklidir!",
        variant: "destructive",
      });
      return;
    }

    const task: Task = {
      id: generateId(),
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      dueDate: newTask.dueDate,
      completed: false,
      notes: [],
      createdAt: new Date().toISOString(),
    };

    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', category: 'work', dueDate: '' });
    setIsAddTaskOpen(false);
    
    toast({
      title: "Başarılı",
      description: "Görev başarıyla eklendi!",
    });
  };

  const updateTask = () => {
    if (!editTask.title.trim()) {
      toast({
        title: "Hata",
        description: "Görev başlığı gereklidir!",
        variant: "destructive",
      });
      return;
    }

    setTasks(tasks.map(task => 
      task.id === editTask.id 
        ? { ...task, title: editTask.title, description: editTask.description, category: editTask.category, dueDate: editTask.dueDate }
        : task
    ));
    
    setIsEditTaskOpen(false);
    setEditTask({ id: '', title: '', description: '', category: 'work', dueDate: '' });
    
    toast({
      title: "Başarılı",
      description: "Görev başarıyla güncellendi!",
    });
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({
      title: "Başarılı",
      description: "Görev başarıyla silindi!",
    });
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
    
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      toast({
        title: "Tebrikler! 🎉",
        description: "Görev tamamlandı!",
      });
    }
  };

  const addNote = () => {
    if (!newNote.trim() || !selectedTask) return;

    const note: Note = {
      id: generateId(),
      taskId: selectedTask.id,
      content: newNote,
      createdAt: new Date().toISOString(),
    };

    setTasks(tasks.map(task => 
      task.id === selectedTask.id 
        ? { ...task, notes: [...task.notes, note] }
        : task
    ));

    setNewNote('');
    setIsAddNoteOpen(false);
    
    toast({
      title: "Başarılı",
      description: "Not başarıyla eklendi!",
    });
  };

  const deleteNote = (taskId: string, noteId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, notes: task.notes.filter(note => note.id !== noteId) }
        : task
    ));
    
    toast({
      title: "Başarılı",
      description: "Not başarıyla silindi!",
    });
  };

  const openEditTask = (task: Task) => {
    setEditTask({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      dueDate: task.dueDate,
    });
    setIsEditTaskOpen(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const pendingCount = tasks.filter(task => !task.completed).length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Görev Yöneticisi
            </h1>
            <p className="text-muted-foreground mt-2">Görevlerinizi ve notlarınızı kolayca yönetin</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Görev Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Görev Ekle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Başlık</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Görev başlığı girin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Görev açıklaması (opsiyonel)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Son Teslim Tarihi</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                  <Button onClick={addTask} className="w-full">
                    Görev Ekle
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Toplam Görev</p>
                  <p className="text-2xl font-bold">{tasks.length}</p>
                </div>
                <Circle className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Tamamlanan</p>
                  <p className="text-2xl font-bold">{completedCount}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Bekleyen</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Görev ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Kategori filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const category = categories.find(cat => cat.value === task.category);
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
            
            return (
              <Card key={task.id} className={`transition-all duration-300 hover:shadow-lg ${task.completed ? 'opacity-75' : ''} ${isOverdue ? 'border-red-300' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTaskComplete(task.id)}
                        className="p-0 h-auto"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground hover:text-green-500" />
                        )}
                      </Button>
                      <CardTitle className={`text-lg ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditTask(task)}
                        className="p-1 h-auto"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                        className="p-1 h-auto text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {category && (
                    <Badge className={`${category.color} text-white w-fit`}>
                      <Tag className="h-3 w-3 mr-1" />
                      {category.label}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                  
                  {task.dueDate && (
                    <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                      <Calendar className="h-4 w-4" />
                      {new Date(task.dueDate).toLocaleString('tr-TR')}
                      {isOverdue && <span className="text-red-500 font-medium">(Gecikmiş)</span>}
                    </div>
                  )}

                  {task.notes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <StickyNote className="h-4 w-4" />
                        Notlar ({task.notes.length})
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {task.notes.map((note) => (
                          <div key={note.id} className="bg-muted/50 p-2 rounded text-sm relative group">
                            <p>{note.content}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNote(task.id, note.id)}
                              className="absolute top-1 right-1 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Dialog open={isAddNoteOpen && selectedTask?.id === task.id} onOpenChange={(open) => {
                    setIsAddNoteOpen(open);
                    if (open) setSelectedTask(task);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Not Ekle
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Not Ekle</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Notunuzu buraya yazın..."
                          rows={4}
                        />
                        <Button onClick={addNote} className="w-full">
                          Not Ekle
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Circle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              {searchTerm || filterCategory !== 'all' ? 'Sonuç bulunamadı' : 'Henüz görev yok'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || filterCategory !== 'all' 
                ? 'Arama kriterlerinizi değiştirmeyi deneyin' 
                : 'İlk görevinizi ekleyerek başlayın'}
            </p>
          </div>
        )}

        {/* Edit Task Dialog */}
        <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Görevi Düzenle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editTitle">Başlık</Label>
                <Input
                  id="editTitle"
                  value={editTask.title}
                  onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                  placeholder="Görev başlığı girin"
                />
              </div>
              <div>
                <Label htmlFor="editDescription">Açıklama</Label>
                <Textarea
                  id="editDescription"
                  value={editTask.description}
                  onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                  placeholder="Görev açıklaması (opsiyonel)"
                />
              </div>
              <div>
                <Label htmlFor="editCategory">Kategori</Label>
                <Select value={editTask.category} onValueChange={(value) => setEditTask({ ...editTask, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editDueDate">Son Teslim Tarihi</Label>
                <Input
                  id="editDueDate"
                  type="datetime-local"
                  value={editTask.dueDate}
                  onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                />
              </div>
              <Button onClick={updateTask} className="w-full">
                Görevi Güncelle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
