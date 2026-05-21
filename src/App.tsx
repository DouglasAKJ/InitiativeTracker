import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { 
  Plus, 
  Minus, 
  Trash2, 
  GripVertical, 
  Skull, 
  UserPlus, 
  RefreshCcw,
  EyeOff,
  Heart,
  EarOff,
  Ghost,
  Hand,
  ZapOff,
  UserMinus,
  Zap,
  Mountain,
  ArrowDown,
  Link,
  Activity,
  Moon,
  BatteryLow,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import './App.css';
import Header from './components/Header';

interface Player {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  initiative: number;
  conditions: string[]; // Store condition IDs
}

const CONDITIONS = [
  { id: 'blinded', name: 'Cego', icon: EyeOff, color: '#94a3b8' },
  { id: 'charmed', name: 'Enfeitiçado', icon: Heart, color: '#f472b6' },
  { id: 'deafened', name: 'Surdo', icon: EarOff, color: '#94a3b8' },
  { id: 'frightened', name: 'Amedrontado', icon: Ghost, color: '#a855f7' },
  { id: 'grappled', name: 'Agarrado', icon: Hand, color: '#fbbf24' },
  { id: 'incapacitated', name: 'Incapacitado', icon: ZapOff, color: '#ef4444' },
  { id: 'invisible', name: 'Invisível', icon: UserMinus, color: '#38bdf8' },
  { id: 'paralyzed', name: 'Paralisado', icon: Zap, color: '#ef4444' },
  { id: 'petrified', name: 'Petrificado', icon: Mountain, color: '#64748b' },
  { id: 'poisoned', name: 'Envenenado', icon: Skull, color: '#22c55e' },
  { id: 'prone', name: 'Caído', icon: ArrowDown, color: '#fbbf24' },
  { id: 'restrained', name: 'Impedido', icon: Link, color: '#fbbf24' },
  { id: 'stunned', name: 'Atordoado', icon: Activity, color: '#ef4444' },
  { id: 'unconscious', name: 'Inconsciente', icon: Moon, color: '#6366f1' },
  { id: 'exhaustion', name: 'Exaustão', icon: BatteryLow, color: '#f97316' },
];

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
  const [activePickerId, setActivePickerId] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setActivePickerId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('rpg-initiative-players');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration for old data structure
        const migrated = parsed.map((p: any) => ({
          ...p,
          conditions: p.conditions || p.condition?.map((c: any) => c.id) || []
        }));
        setPlayers(migrated);
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
      conditions: []
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

  const toggleCondition = (playerId: string, conditionId: string) => {
    setPlayers(players.map(p => {
      if (p.id !== playerId) return p;
      const hasCondition = p.conditions.includes(conditionId);
      return {
        ...p,
        conditions: hasCondition 
          ? p.conditions.filter(c => c !== conditionId)
          : [...p.conditions, conditionId]
      };
    }));
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
                      className={clsx('player-card', snapshot.isDragging && 'dragging', activePickerId === player.id && 'active-picker')}
                    >
                      <div {...provided.dragHandleProps} className="drag-handle">
                        <GripVertical size={20} />
                      </div>
                      
                      <div className="player-main">
                        <div className="player-identity">
                          <span className="player-name">{player.name}</span>
                          <span className="player-initiative">Inic: {player.initiative}</span>
                          <div className="player-conditions">
                            {player.conditions.map((condId) => {
                              const cond = CONDITIONS.find(c => c.id === condId);
                              if (!cond) return null;
                              const Icon = cond.icon;
                              return (
                                <button 
                                  key={condId} 
                                  className="condition-icon-btn"
                                  onClick={() => toggleCondition(player.id, condId)}
                                  title={cond.name}
                                  style={{ color: cond.color }}
                                >
                                  <Icon size={16} />
                                </button>
                              );
                            })}
                            <button 
                              className="btn-add-condition" 
                              onClick={() => setActivePickerId(activePickerId === player.id ? null : player.id)}
                              title="Adicionar Condição"
                            >
                              <Plus size={14} />
                            </button>

                            {activePickerId === player.id && (
                              <div className="condition-picker" ref={pickerRef}>
                                <div className="picker-header">
                                  <span>Condições</span>
                                  <button onClick={() => setActivePickerId(null)} className="btn-close-picker"><X size={14} /></button>
                                </div>
                                <div className="picker-grid">
                                  {CONDITIONS.map(cond => {
                                    const Icon = cond.icon;
                                    const isActive = player.conditions.includes(cond.id);
                                    return (
                                      <button 
                                        key={cond.id}
                                        className={clsx("picker-item", isActive && "active")}
                                        onClick={() => toggleCondition(player.id, cond.id)}
                                        title={cond.name}
                                      >
                                        <Icon size={18} style={{ color: cond.color }} />
                                        <span>{cond.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
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
