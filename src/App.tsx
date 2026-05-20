import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { 
  Plus, 
  Minus, 
  Trash2, 
  GripVertical, 
  Skull, 
  UserPlus, 
  RefreshCcw
} from 'lucide-react';""
import { clsx } from 'clsx';
import './App.css';
import Header from './components/Header';

interface Player {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  initiative: number;
}

// Fallback for crypto.randomUUID if not available (non-secure context)
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11);
};

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState('');
  const [hp, setHp] = useState<number>(10);
  const [initiative, setInitiative] = useState<number>(10);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('rpg-initiative-players');
    if (saved) {
      try {
        setPlayers(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load players", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('rpg-initiative-players', JSON.stringify(players));
  }, [players]);

  const addPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlayer: Player = {
      id: generateId(),
      name,
      maxHp: hp,
      currentHp: hp,
      initiative,
    };

    // New players go to their initiative position by default
    const newPlayers = [...players, newPlayer].sort((a, b) => b.initiative - a.initiative);
    setPlayers(newPlayers);
    setName('');
    setHp(10);
    setInitiative(10);
  };

  const updateHp = (id: string, delta: number) => {
    setPlayers(players.map(p => 
      p.id === id ? { ...p, currentHp: Math.max(0, p.currentHp + delta) } : p
    ));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(players);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPlayers(items);
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const clearTable = () => {
    if (window.confirm("Deseja realmente limpar toda a tabela de iniciativa?")) {
      setPlayers([]);
    }
  };

  return (
    <div className="app-container">
      
      <Header />

      <section className="controls-panel">
        <form className="add-form" onSubmit={addPlayer}>
          <div className="input-group">
            <label><span className="label-icon"><UserPlus size={14}/></span> Herói / Vilão</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Ex: Baruch, o Fidalgo" 
              required 
            />
          </div>
          <div className="input-group short">
            <label>HP Máx</label>
            <input 
              type="number" 
              value={hp} 
              onChange={e => setHp(parseInt(e.target.value) || 0)} 
            />
          </div>
          <div className="input-group short">
            <label>Iniciativa</label>
            <input 
              type="number" 
              value={initiative} 
              onChange={e => setInitiative(parseInt(e.target.value) || 0)} 
            />
          </div>
          <button type="submit" className="btn-add">
            <Plus size={18} />
            <span>Adicionar</span>
          </button>
        </form>

        <button className="btn-clear" onClick={clearTable} title="Limpar Iniciativa">
          <RefreshCcw size={18} />
          <span>Limpar Mesa</span>
        </button>
      </section>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="players">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef} 
              className="initiative-list"
            >
              {players.length === 0 && (
                <div className="empty-state">
                  <Skull size={48} opacity={0.3} />
                  <p>A arena está vazia. Adicione combatentes para começar.</p>
                </div>
              )}
              {players.map((player, index) => (
                <Draggable key={player.id} draggableId={player.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={clsx('player-card', snapshot.isDragging && 'dragging')}
                    >
                      <div {...provided.dragHandleProps} className="drag-handle">
                        <GripVertical size={20} />
                      </div>
                      
                      <div className="player-main">
                        <div className="player-identity">
                          <span className="player-name">{player.name}</span>
                          <span className="player-initiative">Inic: {player.initiative}</span>
                        </div>

                        <div className="hp-system">
                          <button className="hp-btn minus" onClick={() => updateHp(player.id, -1)}>
                            <Minus size={14} />
                            <p>-1</p>
                          </button>
                          <button className="hp-btn-10 minus" onClick={() => updateHp(player.id, -10)}>
                            <Minus size={14} />
                            <p>-10</p>
                          </button>
                          
                          <div className="hp-meter">
                            <div className="hp-values">
                              <span className="current">{player.currentHp}</span>
                              <span className="separator">/</span>
                              <span className="max">{player.maxHp}</span>
                            </div>
                            <div className="progress-track">
                              <div 
                                className={clsx(
                                  "progress-fill",
                                  player.currentHp === 0 && "dead",
                                  player.currentHp < player.maxHp * 0.3 && "critical"
                                )} 
                                style={{ width: `${Math.min(100, (player.currentHp / player.maxHp) * 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <button className="hp-btn-10 plus" onClick={() => updateHp(player.id, 10)}>
                            <Plus size={14} />
                            <p>+10</p>
                          </button>
                          <button  className="hp-btn plus" onClick={() => updateHp(player.id, 1)}>
                            <Plus size={14} />
                            <p>+1</p>
                          </button>
                        </div>
                      </div>

                      <button className="btn-delete" onClick={() => removePlayer(player.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default App;
