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
  X,
  Eye
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
  { id: 'blinded', name: 'Cego', description: 'Uma criatura cega não consegue ver e falha automaticamente em qualquer teste de habilidade que exija visão. As jogadas de ataque contra a criatura têm vantagem, e as jogadas de ataque da criatura têm desvantagem.', icon: EyeOff, color: '#94a3b8' },
  { id: 'charmed', name: 'Encantado', description: 'Uma criatura encantada não pode atacar o encantador nem atacá-lo com habilidades prejudiciais ou efeitos mágicos. O encantador tem vantagem em qualquer teste de habilidade para interagir socialmente com a criatura.', icon: Heart, color: '#f472b6' },
  { id: 'deafened', name: 'Surdo', description: 'Uma criatura surda não consegue ouvir e falha automaticamente em qualquer teste de habilidade que exija audição.', icon: EarOff, color: '#94a3b8' },
  { id: 'frightened', name: 'Amedrontado', description: 'Uma criatura amedrontada tem desvantagem em testes de  habilidade e testes de ataque, enquanto a fonte de seu medo está dentro da linha de visão. A criatura não pode se aproximar voluntariamente da fonte de seu medo.', icon: Ghost, color: '#a855f7' },
  { id: 'grappled', name: 'Agarrado', description: 'A velocidade de uma criatura agarrada torna-se 0, e ela não pode se beneficiar de nenhum bônus em sua velocidade. A condição termina se o agarrador estiver incapacitado (veja a condição). A condição também termina se um efeito remover a criatura agarrada do alcance do agarrador ou efeito de agarrar, como quando uma criatura é arremessada para longe pelo feitiço da onda de trovão.', icon: Hand, color: '#fbbf24' },
  { id: 'incapacitated', name: 'Incapacitado', description: 'Uma criatura incapacitada não pode tomar ações ou reações.', icon: ZapOff, color: '#ef4444' },
  { id: 'invisible', name: 'Invisível', description: 'É impossível ver uma criatura invisível sem a ajuda de magia ou de um sentido especial. Com o propósito de se esconder, a criatura fica fortemente obscurecida. A localização da criatura pode ser detectada por qualquer ruído que ela faça ou por quaisquer rastros que ela deixe. As jogadas de ataque contra a criatura têm  desvantagem, e as jogadas de ataque da criatura têm  vantagem.', icon: UserMinus, color: '#38bdf8' },
  { id: 'paralyzed', name: 'Paralisado', description: 'Uma criatura paralisada fica incapacitada (veja a condição) e não consegue se mover ou falar. A criatura falha automaticamente nos salva-guardas de Força e Destreza. Rolagens de ataque contra a criatura têm  vantagem. Qualquer ataque que atinja a criatura é um golpe crítico se o atacante estiver a 1,5 metro da criatura. ', icon: Zap, color: '#ef4444' },
  { id: 'petrified', name: 'Petrificado', description: 'Uma criatura petrificada é transformada, junto com qualquer objeto não mágico que esteja vestindo ou carregando, em uma substância sólida inanimada (geralmente pedra). Seu peso aumenta por um fator de dez e cessa o envelhecimento. A criatura está incapacitada (veja a condição), não consegue se mover ou falar e não tem consciência do que a cerca. Rolagens de ataque contra a criatura têm  vantagem. A criatura falha automaticamente nos salva-guardas de Força e Destreza. A criatura tem resistência a todo dano. A criatura é imune a venenos e doenças, embora um veneno ou doença já presente em seu organismo está suspenso, não neutralizado.', icon: Mountain, color: '#64748b' },
  { id: 'poisoned', name: 'Envenenado', description: 'Uma criatura envenenada tem desvantagem em testes de ataque e testes de habilidade.', icon: Skull, color: '#22c55e' },
  { id: 'prone', name: 'Caído', description: 'A única opção de movimento de uma criatura propensa é rastejar, a menos que ela se levante e, assim, acabe com a condição. A criatura tem  desvantagem em  testes de ataque. Uma jogada  de ataque contra a criatura tem  vantagem se o atacante estiver a 1,5 metro da criatura. Caso contrário, a jogada de ataque tem  desvantagem.',  icon: ArrowDown, color: '#fbbf24' },
  { id: 'restrained', name: 'Impedido', description: 'A velocidade de uma criatura impedida se torna 0, e ela não pode se beneficiar de nenhum bônus em sua velocidade. As jogadas de ataque contra a criatura têm  vantagem, e as jogadas de ataque da criatura têm  desvantagem. A criatura tem desvantagem em arremess os que salvam Destreza.', icon: Link, color: '#fbbf24' },
  { id: 'stunned', name: 'Atordoado', description: 'Uma criatura atordoada fica incapacitada (veja a condição), não consegue se mover e só consegue falar vacilantemente. A criatura falha automaticamente nos arremess os que salvam Força e Destreza. Rolagens de ataque contra a criatura têm  vantagem.', icon: Activity, color: '#ef4444' },
  { id: 'unconscious', name: 'Inconsciente', description: 'Uma criatura inconsciente está incapacitada (veja a condição), não consegue se mover ou falar e não tem consciência do que está ao seu redor. A criatura deixa cair tudo o que está segurando e cai de bruços. A criatura falha automaticamente nos salva-guardas de Força e Destreza. Rolagens de ataque contra a criatura têm  vantagem. Qualquer ataque que atinja a criatura é um golpe crítico se o atacante estiver a 1,5 metro da criatura.', icon: Moon, color: '#6366f1' },
  { id: 'exhaustion', name: 'Exaustão', description: 'Uma criatura pode sofrer seis níveis de exaustão. Cada nível concede um efeito cumulativo: 1. Desvantagem em testes de habilidade; 2. Deslocamento reduzido à metade; 3. Desvantagem em jogadas de ataque e salvaguardas; 4. Máximo de pontos de vida reduzido à metade; 5. Deslocamento reduzido a 0; 6. Morte.', icon: BatteryLow, color: '#f97316' },
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

  const [hoveredCondition, setHoveredCondition] = useState<{
    name: string;
    description: string;
    x: number;
    y: number;
    showTooltip: boolean;
  } | null>(null);
  const hoverTimerRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

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

  // Tooltip dynamic positioning
  useEffect(() => {
    if (hoveredCondition?.showTooltip && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const padding = 20;
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      let nx = hoveredCondition.x + padding;
      let ny = hoveredCondition.y + padding;

      // Check right boundary
      if (nx + rect.width > winW) {
        nx = hoveredCondition.x - rect.width - padding;
      }
      // Check bottom boundary
      if (ny + rect.height > winH) {
        ny = hoveredCondition.y - rect.height - padding;
      }

      // Ensure it doesn't go off left or top
      nx = Math.max(padding, nx);
      ny = Math.max(padding, ny);

      setTooltipStyle({
        left: nx,
        top: ny,
        visibility: 'visible'
      });
    } else {
      setTooltipStyle({ visibility: 'hidden' });
    }
  }, [hoveredCondition?.showTooltip, hoveredCondition?.x, hoveredCondition?.y]);

  const handleConditionMouseEnter = (e: React.MouseEvent, cond: typeof CONDITIONS[0]) => {
    const { clientX, clientY } = e;
    setHoveredCondition({
      name: cond.name,
      description: cond.description || '',
      x: clientX,
      y: clientY,
      showTooltip: false
    });

    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    
    hoverTimerRef.current = window.setTimeout(() => {
      setHoveredCondition(prev => prev ? { ...prev, showTooltip: true } : null);
    }, 2000);
  };

  const handleConditionMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setHoveredCondition(prev => prev ? { ...prev, x: clientX, y: clientY } : null);
  };

  const handleConditionMouseLeave = () => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    setHoveredCondition(null);
  };

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
                                  onMouseEnter={(e) => handleConditionMouseEnter(e, cond)}
                                  onMouseMove={handleConditionMouseMove}
                                  onMouseLeave={handleConditionMouseLeave}
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
                                        onMouseEnter={(e) => handleConditionMouseEnter(e, cond)}
                                        onMouseMove={handleConditionMouseMove}
                                        onMouseLeave={handleConditionMouseLeave}
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

      {hoveredCondition && (
        <>
          <div 
            className="cursor-indicator"
            style={{ 
              left: hoveredCondition.x + 12, 
              top: hoveredCondition.y + 12 
            }}
          >
            <Eye size={18} />
          </div>
          
          {hoveredCondition.showTooltip && (
            <div 
              ref={tooltipRef}
              className="condition-description-tooltip"
              style={tooltipStyle}
            >
              <div className="tooltip-header">
                <strong>{hoveredCondition.name}</strong>
              </div>
              <p>{hoveredCondition.description}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
