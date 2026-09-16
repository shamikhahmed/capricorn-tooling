/**
 * Cap Architecture Connection Map viewer (SPEC §5)
 * Zero runtime deps. Loads window.ARCH_DATA from architecture-data.js (file:// safe).
 */
(function () {
  'use strict';

  var SVG_LIMIT = 600;
  var LARGE_NODE_THRESHOLD = 80;
  var CLUSTER_VISIBLE_LIMIT = 400;
  var WORKSPACE_KEY = 'cap-arch-workspace-root';
  var THEME_KEY = 'cap-arch-theme';

  var NODE_ICONS = {
    app: '🧭', entry: '▶', config: '⚙', route: '🔀', screen: '📱', layout: '▦',
    component: '⚛', primitive: '◻', event: '⚡', function: 'ƒ', hook: '🪝',
    'class': '◈', logic: '🧠', validator: '✔', state: '●', store: '◉',
    context: '◎', service: '⚙︎', worker: '⛭', 'api-endpoint': '🌐',
    external: '☁', auth: '🔐', database: '🗄', table: '▤', column: '┆',
    storage: '📦', 'static-data': '📄', env: '🔑', file: '📄', dependency: '📚'
  };

  var LAYER_ORDER = [
    'app', 'screen', 'component', 'event', 'logic', 'state',
    'service', 'data-access', 'data', 'external', 'config'
  ];

  var UI_EDGES = { RENDERS: 1, ROUTES_TO: 1, NAVIGATES_TO: 1, LOADS: 1 };
  var DATA_EDGES = {
    READS: 1, WRITES: 1, UPDATES: 1, QUERIES: 1, MUTATES: 1, STORES_IN: 1,
    PERSISTS_TO: 1, FETCHES_FROM: 1, CACHES: 1, DERIVES_FROM: 1, STATE: 1
  };
  var BACKEND_TYPES = {
    'api-endpoint': 1, database: 1, table: 1, column: 1, worker: 1,
    service: 1, external: 1, storage: 1, env: 1
  };

  var state = {
    data: null,
    mode: 'focus',
    depth: 2,
    mainTab: 'graph',
    leftTab: 'tree',
    selectedId: null,
    highlightPath: [],
    filters: {
      nodeTypes: null,
      edgeTypes: null,
      statuses: null,
      flags: null,
      layers: null,
      features: null,
      folders: null
    },
    searchQuery: '',
    panX: 0,
    panY: 0,
    zoom: 1,
    dragging: false,
    lastX: 0,
    lastY: 0,
    layout: null,
    workspaceRoot: localStorage.getItem(WORKSPACE_KEY) || '',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  function $(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function iconFor(type) {
    return NODE_ICONS[type] || '•';
  }

  function nodeMap(data) {
    var m = Object.create(null);
    (data.nodes || []).forEach(function (n) { m[n.id] = n; });
    return m;
  }

  function adjLists(data) {
    var out = Object.create(null);
    var inn = Object.create(null);
    (data.nodes || []).forEach(function (n) {
      out[n.id] = [];
      inn[n.id] = [];
    });
    (data.edges || []).forEach(function (e) {
      if (out[e.from]) out[e.from].push(e);
      if (inn[e.to]) inn[e.to].push(e);
    });
    return { out: out, inn: inn };
  }

  function passesNodeFilters(n, f) {
    if (f.nodeTypes && f.nodeTypes.length && f.nodeTypes.indexOf(n.type) === -1) return false;
    if (f.layers && f.layers.length && f.layers.indexOf(n.layer || '') === -1) return false;
    if (f.features && f.features.length && f.features.indexOf(n.feature || '') === -1) return false;
    if (f.folders && f.folders.length) {
      var folder = (n.file || '').split('/').slice(0, -1).join('/') || '.';
      if (f.folders.indexOf(folder) === -1) return false;
    }
    if (f.flags && f.flags.length) {
      var flags = n.flags || [];
      var hit = f.flags.some(function (flag) { return flags.indexOf(flag) !== -1; });
      if (!hit) return false;
    }
    return true;
  }

  function passesEdgeFilters(e, f) {
    if (f.edgeTypes && f.edgeTypes.length && f.edgeTypes.indexOf(e.type) === -1) return false;
    if (f.statuses && f.statuses.length && f.statuses.indexOf(e.status) === -1) return false;
    return true;
  }

  function modeAllowsEdge(mode, e) {
    if (mode === 'data') return !!DATA_EDGES[e.type];
    if (mode === 'ui') return !!UI_EDGES[e.type];
    return true;
  }

  function modeAllowsNode(mode, n) {
    if (mode === 'backend') return !!BACKEND_TYPES[n.type];
    if (mode === 'feature') return !!(n.feature);
    return true;
  }

  function findEntryNode(data) {
    var nodes = data.nodes || [];
    var app = nodes.find(function (n) { return n.type === 'app'; });
    if (app) return app;
    var entry = nodes.find(function (n) { return n.type === 'entry'; });
    return entry || nodes[0] || null;
  }

  function neighborhood(seedIds, adj, depth, edgePred) {
    var keep = Object.create(null);
    var queue = [];
    seedIds.forEach(function (id) {
      keep[id] = true;
      queue.push({ id: id, d: 0 });
    });
    var i = 0;
    while (i < queue.length) {
      var cur = queue[i++];
      if (depth !== 'full' && cur.d >= depth) continue;
      var edges = (adj.out[cur.id] || []).concat(adj.inn[cur.id] || []);
      edges.forEach(function (e) {
        if (edgePred && !edgePred(e)) return;
        var other = e.from === cur.id ? e.to : e.from;
        if (!keep[other]) {
          keep[other] = true;
          queue.push({ id: other, d: cur.d + 1 });
        }
      });
    }
    return keep;
  }

  function visibleSubset(data, adj) {
    var f = state.filters;
    var mode = state.mode;
    var depth = state.depth === 'full' ? 'full' : Number(state.depth);
    var nodes = (data.nodes || []).filter(function (n) {
      return passesNodeFilters(n, f) && modeAllowsNode(mode, n);
    });
    var edges = (data.edges || []).filter(function (e) {
      return passesEdgeFilters(e, f) && modeAllowsEdge(mode, e);
    });

    var idSet = Object.create(null);
    nodes.forEach(function (n) { idSet[n.id] = true; });

    if (mode === 'focus' || (data.nodes || []).length > LARGE_NODE_THRESHOLD) {
      var seed = state.selectedId || (findEntryNode(data) && findEntryNode(data).id);
      if (seed) {
        var keep = neighborhood([seed], adj, depth === 'full' ? 2 : depth, function (e) {
          return passesEdgeFilters(e, f) && modeAllowsEdge(mode, e);
        });
        nodes = nodes.filter(function (n) { return keep[n.id]; });
        idSet = Object.create(null);
        nodes.forEach(function (n) { idSet[n.id] = true; });
      }
    }

    edges = edges.filter(function (e) { return idSet[e.from] && idSet[e.to]; });

    // Cluster by folder when too many visible nodes
    if (nodes.length > CLUSTER_VISIBLE_LIMIT) {
      return clusterByFolder(nodes, edges);
    }
    return { nodes: nodes, edges: edges, clustered: false };
  }

  function clusterByFolder(nodes, edges) {
    var clusters = Object.create(null);
    var map = Object.create(null);
    nodes.forEach(function (n) {
      var folder = (n.file || '.').split('/').slice(0, -1).join('/') || '.';
      if (n.type === 'app' || n.type === 'entry') {
        map[n.id] = n.id;
        clusters[n.id] = n;
        return;
      }
      var cid = 'cluster:' + folder;
      map[n.id] = cid;
      if (!clusters[cid]) {
        clusters[cid] = {
          id: cid,
          type: 'file',
          name: folder + '/ (' + 0 + ')',
          file: folder,
          layer: 'logic',
          flags: ['CLUSTER'],
          meta: { count: 0, members: [] },
          _cluster: true
        };
      }
      clusters[cid].meta.count++;
      clusters[cid].meta.members.push(n.id);
      clusters[cid].name = folder + '/ (' + clusters[cid].meta.count + ')';
    });

    var cNodes = Object.keys(clusters).map(function (k) { return clusters[k]; });
    var seen = Object.create(null);
    var cEdges = [];
    edges.forEach(function (e) {
      var a = map[e.from];
      var b = map[e.to];
      if (!a || !b || a === b) return;
      var id = a + '->' + b + ':' + e.type;
      if (seen[id]) return;
      seen[id] = true;
      cEdges.push({
        id: 'e:cluster:' + id,
        from: a,
        to: b,
        type: e.type,
        status: e.status,
        evidence: e.evidence || [],
        label: e.label
      });
    });
    return { nodes: cNodes, edges: cEdges, clustered: true };
  }

  function layoutGraph(nodes) {
    var cols = Object.create(null);
    LAYER_ORDER.forEach(function (l, i) { cols[l] = i; });
    var buckets = {};
    nodes.forEach(function (n) {
      var layer = n.layer || 'logic';
      if (cols[layer] == null) layer = 'logic';
      if (!buckets[layer]) buckets[layer] = [];
      buckets[layer].push(n);
    });

    var positions = Object.create(null);
    var colW = 220;
    var rowH = 56;
    var maxH = 0;
    LAYER_ORDER.forEach(function (layer, ci) {
      var list = (buckets[layer] || []).slice().sort(function (a, b) {
        return (a.name || '').localeCompare(b.name || '');
      });
      list.forEach(function (n, ri) {
        positions[n.id] = {
          x: 60 + ci * colW,
          y: 50 + ri * rowH,
          w: 160,
          h: 36,
          layer: layer
        };
      });
      maxH = Math.max(maxH, list.length);
    });
    return {
      positions: positions,
      width: 60 + LAYER_ORDER.length * colW + 40,
      height: Math.max(400, 50 + maxH * rowH + 80),
      layers: LAYER_ORDER
    };
  }

  function applyTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved);
      $('btn-theme').setAttribute('aria-pressed', saved === 'dark' ? 'true' : 'false');
    }
  }

  function renderTopbar(data) {
    $('app-name').textContent = data.app || 'Architecture Map';
    document.title = (data.app || 'Architecture') + ' — Architecture Map';
    $('app-version').textContent = data.appVersion ? 'v' + data.appVersion : '';
    $('app-commit').textContent = data.sourceCommit ? data.sourceCommit.slice(0, 8) : '';
    $('app-generated').textContent = data.generatedAt
      ? 'generated ' + new Date(data.generatedAt).toLocaleString()
      : '';

    var s = data.stats || {};
    var chips = [
      ['nodes', (data.nodes || []).length],
      ['edges', (s.edges && s.edges.total) || (data.edges || []).length],
      ['orphans', s.orphans || 0, 'bad'],
      ['broken', s.brokenPaths || 0, 'bad'],
      ['unused', s.unused || 0, 'warn'],
      ['unknown', s.unknown || 0, 'warn'],
      ['security', s.securityItems || 0, 'bad'],
      ['findings', s.findings || (data.findings || []).length]
    ];
    $('health-summary').innerHTML = chips.map(function (c) {
      var cls = c[2] && c[1] ? c[2] : '';
      return '<button type="button" class="' + cls + '" data-health="' + escapeHtml(c[0]) + '">' +
        escapeHtml(c[0]) + ': ' + c[1] + '</button>';
    }).join('');
  }

  function renderLeft(data) {
    var host = $('left-panel');
    if (state.leftTab === 'tree') {
      var byFile = {};
      (data.nodes || []).forEach(function (n) {
        var f = n.file || '.';
        if (!byFile[f]) byFile[f] = [];
        byFile[f].push(n);
      });
      var files = Object.keys(byFile).sort();
      host.innerHTML = '<p class="muted">Files (' + files.length + ')</p>' +
        files.map(function (f) {
          return '<div><div class="mono muted">' + escapeHtml(f) + '</div>' +
            byFile[f].map(function (n) {
              return '<button type="button" class="tree-item' +
                (n.id === state.selectedId ? ' active' : '') +
                '" data-node="' + escapeHtml(n.id) + '">' +
                '<span class="node-icon" aria-hidden="true">' + iconFor(n.type) + '</span>' +
                '<span>' + escapeHtml(n.name) + '</span>' +
                '<span class="badge">' + escapeHtml(n.type) + '</span></button>';
            }).join('') + '</div>';
        }).join('');
    } else if (state.leftTab === 'types') {
      var counts = {};
      (data.nodes || []).forEach(function (n) {
        counts[n.type] = (counts[n.type] || 0) + 1;
      });
      host.innerHTML = Object.keys(counts).sort().map(function (t) {
        return '<button type="button" class="tree-item" data-filter-type="' + escapeHtml(t) + '">' +
          '<span class="node-icon" aria-hidden="true">' + iconFor(t) + '</span>' +
          escapeHtml(t) + ' <span class="badge">' + counts[t] + '</span></button>';
      }).join('');
    } else if (state.leftTab === 'features') {
      var feats = data.features || [];
      if (!feats.length) {
        host.innerHTML = '<p class="muted">No features in architecture.config.json</p>';
      } else {
        host.innerHTML = feats.map(function (f) {
          return '<button type="button" class="tree-item" data-filter-feature="' +
            escapeHtml(f.name) + '">' + escapeHtml(f.name) +
            ' <span class="badge">' + escapeHtml(f.overall || '') + '</span></button>';
        }).join('');
      }
    } else {
      host.innerHTML =
        '<p class="muted">Click health chips or type filters to narrow the graph. Clear resets.</p>' +
        '<button type="button" id="btn-clear-filters">Clear filters</button>' +
        '<div class="rel-group"><h4>Quick flags</h4>' +
        ['ORPHANED', 'UNUSED', 'DEAD', 'DUPLICATED', 'SUSPICIOUS', 'HARDCODED', 'MOCK', 'DEMO', 'SECURITY']
          .map(function (flag) {
            return '<label class="filter-row"><input type="checkbox" data-flag="' + flag + '"' +
              (state.filters.flags && state.filters.flags.indexOf(flag) !== -1 ? ' checked' : '') +
              '> ' + flag + '</label>';
          }).join('') + '</div>';
    }
  }

  function howThisWorks(node, adj, nodesById) {
    var outs = adj.out[node.id] || [];
    var inns = adj.inn[node.id] || [];
    var parts = [];
    parts.push(iconFor(node.type) + ' ' + node.name + ' is a ' + node.type +
      (node.file ? ' in ' + node.file + (node.line ? ':' + node.line : '') : '') + '.');
    if (inns.length) {
      parts.push('It is reached via ' + inns.slice(0, 5).map(function (e) {
        var src = nodesById[e.from];
        return (e.type + ' from ' + (src ? src.name : e.from) + ' [' + e.status + ']');
      }).join('; ') + (inns.length > 5 ? '…' : '') + '.');
    } else {
      parts.push('No verified inbound edges were found (may be an entry or orphan).');
    }
    if (outs.length) {
      parts.push('It connects outbound via ' + outs.slice(0, 5).map(function (e) {
        var dst = nodesById[e.to];
        return (e.type + ' to ' + (dst ? dst.name : e.to) + ' [' + e.status + ']');
      }).join('; ') + (outs.length > 5 ? '…' : '') + '.');
    } else {
      parts.push('No outbound edges were recorded.');
    }
    var flags = node.flags || [];
    if (flags.length) parts.push('Flags: ' + flags.join(', ') + '.');
    var unknown = outs.concat(inns).filter(function (e) {
      return e.status === 'UNKNOWN' || e.status === 'BROKEN';
    });
    if (unknown.length) {
      parts.push(unknown.length + ' connection(s) are UNKNOWN or BROKEN — do not treat them as proven.');
    }
    return parts.join(' ');
  }

  function editorLink(file, line) {
    if (!state.workspaceRoot || !file) return '';
    var abs = state.workspaceRoot.replace(/\/$/, '') + '/' + file.replace(/^\.\//, '');
    var loc = abs + ':' + (line || 1);
    return ' <a href="cursor://file/' + encodeURI(abs) + ':' + (line || 1) + '">cursor</a>' +
      ' · <a href="vscode://file/' + encodeURI(abs) + ':' + (line || 1) + '">vscode</a>' +
      ' · <button type="button" data-copy="' + escapeHtml(file + ':' + (line || 1)) + '">copy</button>';
  }

  function renderRight(data, adj) {
    var host = $('right-panel');
    var nodesById = nodeMap(data);
    var node = state.selectedId ? nodesById[state.selectedId] : null;
    if (!node) {
      host.innerHTML = '<p class="muted">Select a node to inspect relationships, evidence, and “How this works”.</p>';
      return;
    }
    var outs = adj.out[node.id] || [];
    var inns = adj.inn[node.id] || [];
    function group(title, list, dir) {
      if (!list.length) return '';
      var byType = {};
      list.forEach(function (e) {
        if (!byType[e.type]) byType[e.type] = [];
        byType[e.type].push(e);
      });
      return '<div class="rel-group"><h4>' + escapeHtml(title) + '</h4>' +
        Object.keys(byType).map(function (t) {
          return '<div><strong>' + escapeHtml(t) + '</strong><ul>' +
            byType[t].map(function (e) {
              var otherId = dir === 'out' ? e.to : e.from;
              var other = nodesById[otherId];
              return '<li><button type="button" class="tree-item" data-node="' +
                escapeHtml(otherId) + '">' + escapeHtml(other ? other.name : otherId) +
                '</button> <span class="badge ' + escapeHtml(e.status) + '">' +
                escapeHtml(e.status) + '</span></li>';
            }).join('') + '</ul></div>';
        }).join('') + '</div>';
    }

    host.innerHTML =
      '<div><span class="node-icon" aria-hidden="true">' + iconFor(node.type) + '</span> ' +
      '<strong>' + escapeHtml(node.name) + '</strong></div>' +
      '<div class="muted">' + escapeHtml(node.type) +
      (node.layer ? ' · layer ' + escapeHtml(node.layer) : '') +
      (node.feature ? ' · feature ' + escapeHtml(node.feature) : '') + '</div>' +
      '<div class="mono">' + escapeHtml(node.file || '') +
      (node.line ? ':' + node.line : '') +
      editorLink(node.file, node.line) + '</div>' +
      ((node.flags || []).length
        ? '<div>' + node.flags.map(function (f) {
          return '<span class="badge">' + escapeHtml(f) + '</span>';
        }).join(' ') + '</div>'
        : '') +
      group('Outbound', outs, 'out') +
      group('Inbound', inns, 'in') +
      '<div class="how"><strong>How this works</strong><p>' +
      escapeHtml(howThisWorks(node, adj, nodesById)) + '</p></div>';

    $('sr-summary').textContent = howThisWorks(node, adj, nodesById);
    renderEvidence(node, outs.concat(inns));
  }

  function renderEvidence(node, edges) {
    var host = $('evidence-panel');
    var rows = [];
    if (node && node.file) {
      rows.push({ file: node.file, line: node.line || 0, snippet: 'node definition' });
    }
    (edges || []).forEach(function (e) {
      (e.evidence || []).forEach(function (ev) { rows.push(ev); });
    });
    if (!rows.length) {
      host.innerHTML = '<p class="muted">No evidence for the current selection.</p>';
      return;
    }
    host.innerHTML = rows.map(function (ev) {
      var loc = (ev.file || '') + ':' + (ev.line || 0);
      return '<div class="row"><span>' + escapeHtml(loc) + '</span><span>' +
        escapeHtml(ev.snippet || '') + '</span><span>' +
        '<button type="button" data-copy="' + escapeHtml(loc) + '">copy</button>' +
        editorLink(ev.file, ev.line) + '</span></div>';
    }).join('');
  }

  function edgeStroke(e) {
    if (e.status === 'BROKEN' || e.status === 'UNKNOWN') return 'var(--danger)';
    if (e.status === 'INFERRED') return 'var(--warn)';
    if (DATA_EDGES[e.type]) return 'var(--accent)';
    return 'var(--edge)';
  }

  function edgeDash(e) {
    if (e.type === 'IMPORTS' || e.type === 'EXPORTS' || e.type === 'LOADS') return '2 3';
    if (e.type === 'CONFIG' || e.type === 'ENV') return '6 4';
    if (e.type === 'EXTERNAL' || e.type === 'AUTHENTICATES_THROUGH') return '8 3 2 3';
    return '';
  }

  function renderSvg(subset, layout) {
    var svg = $('graph-svg');
    var canvas = $('graph-canvas');
    canvas.hidden = true;
    svg.hidden = false;
    $('graph-empty').hidden = subset.nodes.length > 0;

    var pos = layout.positions;
    var hl = Object.create(null);
    state.highlightPath.forEach(function (id) { hl[id] = true; });

    var zoneHtml = layout.layers.map(function (layer, i) {
      return '<text x="' + (60 + i * 220) + '" y="24" fill="var(--muted)" font-size="11">' +
        escapeHtml(layer) + '</text>';
    }).join('');

    var edgeHtml = subset.edges.map(function (e) {
      var a = pos[e.from];
      var b = pos[e.to];
      if (!a || !b) return '';
      var x1 = a.x + a.w;
      var y1 = a.y + a.h / 2;
      var x2 = b.x;
      var y2 = b.y + b.h / 2;
      var mid = (x1 + x2) / 2;
      var active = hl[e.from] && hl[e.to];
      return '<path d="M' + x1 + ' ' + y1 + ' C' + mid + ' ' + y1 + ',' + mid + ' ' + y2 + ',' + x2 + ' ' + y2 +
        '" fill="none" stroke="' + edgeStroke(e) + '" stroke-width="' + (active ? 2.5 : (DATA_EDGES[e.type] ? 2 : 1.2)) +
        '" stroke-dasharray="' + edgeDash(e) + '" marker-end="url(#arrow)" opacity="' +
        (state.highlightPath.length && !active ? '0.2' : '0.85') + '" data-edge="' + escapeHtml(e.id) + '">' +
        '<title>' + escapeHtml(e.type + ' · ' + e.status + (e.label ? ' · ' + e.label : '')) + '</title></path>';
    }).join('');

    var nodeHtml = subset.nodes.map(function (n) {
      var p = pos[n.id];
      if (!p) return '';
      var selected = n.id === state.selectedId;
      var dim = state.highlightPath.length && !hl[n.id];
      return '<g class="node" data-node="' + escapeHtml(n.id) + '" transform="translate(' + p.x + ',' + p.y + ')"' +
        ' tabindex="0" role="button" aria-label="' + escapeHtml(n.type + ' ' + n.name) + '" opacity="' +
        (dim ? '0.25' : '1') + '">' +
        '<rect width="' + p.w + '" height="' + p.h + '" rx="6" fill="var(--node-fill)" stroke="' +
        (selected ? 'var(--accent)' : 'var(--node-stroke)') + '" stroke-width="' + (selected ? 2.5 : 1) + '"/>' +
        '<text x="8" y="22" font-size="12" fill="var(--fg)">' +
        escapeHtml(iconFor(n.type) + ' ' + (n.name || '').slice(0, 18)) + '</text>' +
        '<title>' + escapeHtml(n.name + ' · ' + n.type + ' · ' + (n.file || '')) + '</title></g>';
    }).join('');

    svg.setAttribute('viewBox',
      (-state.panX / state.zoom) + ' ' + (-state.panY / state.zoom) + ' ' +
      (layout.width / state.zoom) + ' ' + (layout.height / state.zoom));
    svg.innerHTML =
      '<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
      '<path d="M0 0 L10 5 L0 10 z" fill="var(--edge)"/></marker></defs>' +
      zoneHtml + edgeHtml + nodeHtml;
  }

  function renderCanvas(subset, layout) {
    var svg = $('graph-svg');
    var canvas = $('graph-canvas');
    svg.hidden = true;
    canvas.hidden = false;
    $('graph-empty').hidden = subset.nodes.length > 0;
    var host = $('graph-host');
    var dpr = window.devicePixelRatio || 1;
    var w = host.clientWidth;
    var h = host.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(state.panX, state.panY);
    ctx.scale(state.zoom, state.zoom);

    var pos = layout.positions;
    subset.edges.forEach(function (e) {
      var a = pos[e.from];
      var b = pos[e.to];
      if (!a || !b) return;
      ctx.beginPath();
      ctx.moveTo(a.x + a.w, a.y + a.h / 2);
      ctx.bezierCurveTo((a.x + a.w + b.x) / 2, a.y + a.h / 2, (a.x + a.w + b.x) / 2, b.y + b.h / 2, b.x, b.y + b.h / 2);
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = DATA_EDGES[e.type] ? 2 : 1;
      ctx.stroke();
    });
    subset.nodes.forEach(function (n) {
      var p = pos[n.id];
      if (!p) return;
      ctx.fillStyle = n.id === state.selectedId ? '#0b6e4f' : '#ffffff';
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(p.x, p.y, p.w, p.h, 6);
      else ctx.rect(p.x, p.y, p.w, p.h);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1a1d23';
      ctx.font = '12px sans-serif';
      ctx.fillText((n.name || '').slice(0, 18), p.x + 8, p.y + 22);
    });
    ctx.restore();
  }

  function renderGraph(data, adj) {
    $('graph-host').hidden = false;
    $('list-host').hidden = true;
    var subset = visibleSubset(data, adj);
    var layout = layoutGraph(subset.nodes);
    state.layout = { subset: subset, layout: layout };
    if (subset.nodes.length > SVG_LIMIT) {
      renderCanvas(subset, layout);
    } else {
      renderSvg(subset, layout);
    }
  }

  function renderListTab(data, adj) {
    $('graph-host').hidden = true;
    $('list-host').hidden = false;
    var host = $('list-host');
    var tab = state.mainTab;
    var nodesById = nodeMap(data);
    var html = '';

    function nodeList(pred, title) {
      var list = (data.nodes || []).filter(pred);
      return '<h3>' + escapeHtml(title) + ' (' + list.length + ')</h3>' +
        (list.length ? list.map(function (n) {
          return '<button type="button" class="list-row' + (n.id === state.selectedId ? ' active' : '') +
            '" data-node="' + escapeHtml(n.id) + '">' +
            '<span class="node-icon" aria-hidden="true">' + iconFor(n.type) + '</span>' +
            '<span>' + escapeHtml(n.name) + '</span>' +
            '<span class="mono muted">' + escapeHtml(n.file || '') +
            (n.line ? ':' + n.line : '') + '</span></button>';
        }).join('') : '<p class="muted">None</p>');
    }

    if (tab === 'routes') html = nodeList(function (n) { return n.type === 'route' || n.type === 'screen'; }, 'Routes & screens');
    else if (tab === 'components') html = nodeList(function (n) { return n.type === 'component' || n.type === 'layout' || n.type === 'primitive'; }, 'Components');
    else if (tab === 'services') html = nodeList(function (n) { return n.type === 'service' || n.type === 'worker' || n.type === 'api-endpoint'; }, 'Services');
    else if (tab === 'functions') html = nodeList(function (n) { return n.type === 'function' || n.type === 'hook' || n.type === 'logic' || n.type === 'class'; }, 'Hooks / functions');
    else if (tab === 'state') html = nodeList(function (n) { return n.type === 'state' || n.type === 'store' || n.type === 'context'; }, 'State');
    else if (tab === 'storage') {
      html = '<h3>Storage (' + (data.storage || []).length + ')</h3>' +
        (data.storage || []).map(function (s) {
          return '<div class="list-row"><span class="badge">' + escapeHtml(s.kind || '') +
            '</span> <span class="mono">' + escapeHtml(s.key || '') + '</span></div>';
        }).join('') || '<p class="muted">None</p>';
    } else if (tab === 'network') {
      html = '<h3>Network (' + (data.network || []).length + ')</h3>' +
        (data.network || []).map(function (n) {
          return '<div class="list-row mono">' + escapeHtml(n.host || '') + '</div>';
        }).join('') || '<p class="muted">None</p>';
      html += nodeList(function (n) { return n.type === 'api-endpoint' || n.type === 'external'; }, 'API / external nodes');
    } else if (tab === 'database') {
      var tables = (data.database && data.database.tables) || [];
      html = '<h3>Database ' + escapeHtml((data.database && data.database.engine) || '—') +
        '</h3>' + (tables.map(function (t) {
          return '<div class="list-row"><strong>' + escapeHtml(t.name) + '</strong> ' +
            escapeHtml((t.columns || []).join(', ')) + '</div>';
        }).join('') || '<p class="muted">No tables</p>');
    } else if (tab === 'env') {
      html = '<h3>Env / config (' + (data.env || []).length + ')</h3>' +
        (data.env || []).map(function (e) {
          return '<div class="list-row"><span class="mono">' + escapeHtml(e.name) + '</span>' +
            (e.clientExposed ? ' <span class="badge BROKEN">client-exposed</span>' : '') +
            (e.looksSecret ? ' <span class="badge warn">secret-looking name</span>' : '') +
            '</div>';
        }).join('') || '<p class="muted">None</p>';
    } else if (tab === 'features') {
      html = '<h3>Features</h3>' + ((data.features || []).map(function (f) {
        return '<div class="list-row"><strong>' + escapeHtml(f.name) + '</strong> ' +
          '<span class="badge">' + escapeHtml(f.overall || '') + '</span></div>';
      }).join('') || '<p class="muted">None configured</p>');
    } else if (tab === 'traces') {
      var tr = data.traces || {};
      function traceBlock(title, list) {
        return '<h3>' + escapeHtml(title) + '</h3>' + ((list || []).map(function (t) {
          var pathNames = (t.path || []).map(function (id) {
            return nodesById[id] ? nodesById[id].name : id;
          }).join(' → ');
          return '<div class="list-row"><div><strong>' + escapeHtml(t.name || t.screen || t.element || 'trace') +
            '</strong> <span class="badge">' + escapeHtml(t.status || t.source || '') +
            '</span><div class="mono muted">' + escapeHtml(pathNames) + '</div></div></div>';
        }).join('') || '<p class="muted">None</p>');
      }
      html = traceBlock('Data traces', tr.data) + traceBlock('Action traces', tr.actions) +
        traceBlock('Display traces', tr.display);
    } else if (tab === 'findings') {
      html = '<h3>Findings (' + (data.findings || []).length + ')</h3>' +
        ((data.findings || []).map(function (f) {
          return '<div class="list-row"><span class="badge ' + escapeHtml(f.severity || '') + '">' +
            escapeHtml(f.kind) + '</span> ' + escapeHtml(f.explanation || f.id) + '</div>';
        }).join('') || '<p class="muted">None</p>');
    } else if (tab === 'audit') {
      var s = data.stats || {};
      html = '<h3>Audit snapshot (computed)</h3><ul>' +
        Object.keys(s).map(function (k) {
          var v = s[k];
          if (typeof v === 'object') v = JSON.stringify(v);
          return '<li><strong>' + escapeHtml(k) + '</strong>: ' + escapeHtml(String(v)) + '</li>';
        }).join('') + '</ul>' +
        '<p class="muted">Full AUDIT.md is written beside architecture-data.json by the analyzer.</p>';
    } else if (tab === 'legend') {
      html = '<div class="legend-grid"><div><h3>Node types</h3>' +
        Object.keys(NODE_ICONS).map(function (t) {
          return '<div class="legend-item"><span class="node-icon" aria-hidden="true">' +
            NODE_ICONS[t] + '</span> ' + escapeHtml(t) + '</div>';
        }).join('') + '</div><div><h3>Edge styles</h3>' +
        '<div class="legend-item">dotted — IMPORTS / LOADS / EXPORTS</div>' +
        '<div class="legend-item">solid — UI / behavior</div>' +
        '<div class="legend-item">thick — data reads/writes</div>' +
        '<div class="legend-item">dashed — CONFIG / ENV</div>' +
        '<div class="legend-item">dash-dot — auth / external</div>' +
        '<h3>Statuses</h3>' +
        '<div><span class="badge VERIFIED">VERIFIED</span> resolved evidence</div>' +
        '<div><span class="badge INFERRED">INFERRED</span> strong pattern</div>' +
        '<div><span class="badge UNKNOWN">UNKNOWN</span> unresolved</div>' +
        '<div><span class="badge BROKEN">BROKEN</span> missing target</div>' +
        '</div></div>';
    }
    host.innerHTML = html;
  }

  function render(data) {
    var adj = adjLists(data);
    renderTopbar(data);
    renderLeft(data);
    if (state.mainTab === 'graph') renderGraph(data, adj);
    else renderListTab(data, adj);
    renderRight(data, adj);
  }

  function selectNode(id) {
    state.selectedId = id;
    state.highlightPath = [];
    if (state.mode === 'full' && (state.data.nodes || []).length > LARGE_NODE_THRESHOLD) {
      state.mode = 'focus';
      $('mode-select').value = 'focus';
    }
    render(state.data);
  }

  function trace(direction) {
    if (!state.selectedId || !state.data) return;
    var adj = adjLists(state.data);
    var path = [state.selectedId];
    var cur = state.selectedId;
    var guard = 0;
    while (guard++ < 40) {
      var edges = direction === 'up' ? (adj.inn[cur] || []) : (adj.out[cur] || []);
      if (!edges.length) break;
      var next = direction === 'up' ? edges[0].from : edges[0].to;
      if (path.indexOf(next) !== -1) break;
      path.push(next);
      cur = next;
    }
    state.highlightPath = path;
    state.mainTab = 'graph';
    setMainTabSelected('graph');
    render(state.data);
    $('list-host').hidden = true;
    $('graph-host').hidden = false;
    var names = path.map(function (id) {
      var n = nodeMap(state.data)[id];
      return n ? n.name : id;
    });
    $('sr-summary').textContent = (direction === 'up' ? 'Upstream' : 'Downstream') +
      ' trace: ' + names.join(' → ');
  }

  function impact() {
    if (!state.selectedId || !state.data) return;
    var adj = adjLists(state.data);
    var keep = neighborhood([state.selectedId], adj, 'full', null);
    delete keep[state.selectedId];
    var counts = {};
    Object.keys(keep).forEach(function (id) {
      var n = nodeMap(state.data)[id];
      if (!n) return;
      counts[n.type] = (counts[n.type] || 0) + 1;
    });
    var parts = Object.keys(counts).sort().map(function (t) {
      return counts[t] + ' ' + t + (counts[t] === 1 ? '' : 's');
    });
    state.highlightPath = [state.selectedId].concat(Object.keys(keep));
    render(state.data);
    $('sr-summary').textContent = parts.length
      ? 'Impact: affects ' + parts.join(', ')
      : 'Impact: no downstream nodes';
    alert($('sr-summary').textContent);
  }

  function search(q) {
    q = (q || '').trim();
    state.searchQuery = q;
    if (!q || !state.data) return [];
    var pathLine = /^(.+):(\d+)$/.exec(q);
    var results = [];
    (state.data.nodes || []).forEach(function (n) {
      var hay = [n.name, n.id, n.file, n.type, n.feature].join(' ').toLowerCase();
      if (pathLine) {
        if ((n.file || '') === pathLine[1] && String(n.line || 0) === pathLine[2]) results.push(n);
        else if ((n.file || '').indexOf(pathLine[1]) !== -1 && String(n.line || '') === pathLine[2]) results.push(n);
      } else if (hay.indexOf(q.toLowerCase()) !== -1) {
        results.push(n);
      }
    });
    return results.slice(0, 40);
  }

  function setMainTabSelected(tab) {
    document.querySelectorAll('[data-main-tab]').forEach(function (btn) {
      btn.setAttribute('aria-selected', btn.getAttribute('data-main-tab') === tab ? 'true' : 'false');
    });
  }

  function bindEvents() {
    $('mode-select').addEventListener('change', function (e) {
      state.mode = e.target.value;
      render(state.data);
    });
    $('depth-select').addEventListener('change', function (e) {
      state.depth = e.target.value;
      render(state.data);
    });
    $('btn-trace-up').addEventListener('click', function () { trace('up'); });
    $('btn-trace-down').addEventListener('click', function () { trace('down'); });
    $('btn-impact').addEventListener('click', impact);
    $('btn-fit').addEventListener('click', function () {
      state.panX = 0;
      state.panY = 0;
      state.zoom = 1;
      render(state.data);
    });
    $('btn-reset').addEventListener('click', function () {
      state.selectedId = findEntryNode(state.data) && findEntryNode(state.data).id;
      state.highlightPath = [];
      state.filters = { nodeTypes: null, edgeTypes: null, statuses: null, flags: null, layers: null, features: null, folders: null };
      state.mode = (state.data.nodes || []).length > LARGE_NODE_THRESHOLD ? 'focus' : 'full';
      $('mode-select').value = state.mode;
      state.depth = 2;
      $('depth-select').value = '2';
      state.panX = 0;
      state.panY = 0;
      state.zoom = 1;
      render(state.data);
    });
    $('btn-theme').addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      if (!cur) {
        next = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
      }
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      $('btn-theme').setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    });
    $('btn-workspace').addEventListener('click', function () {
      var v = prompt('Workspace root (absolute path for editor links)', state.workspaceRoot || '');
      if (v == null) return;
      state.workspaceRoot = v.trim();
      if (state.workspaceRoot) localStorage.setItem(WORKSPACE_KEY, state.workspaceRoot);
      else localStorage.removeItem(WORKSPACE_KEY);
      render(state.data);
    });

    var searchBox = $('global-search');
    var resultsEl = null;
    searchBox.addEventListener('input', function () {
      var hits = search(searchBox.value);
      if (resultsEl) resultsEl.remove();
      if (!hits.length) return;
      resultsEl = document.createElement('ul');
      resultsEl.className = 'search-results';
      resultsEl.setAttribute('role', 'listbox');
      hits.forEach(function (n) {
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = n.name + ' — ' + n.type + ' — ' + (n.file || '') + (n.line ? ':' + n.line : '');
        btn.addEventListener('click', function () {
          selectNode(n.id);
          if (resultsEl) resultsEl.remove();
        });
        li.appendChild(btn);
        resultsEl.appendChild(li);
      });
      searchBox.parentNode.style.position = 'relative';
      searchBox.parentNode.appendChild(resultsEl);
    });
    searchBox.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (resultsEl) resultsEl.remove();
        searchBox.value = '';
      }
      if (e.key === 'Enter') {
        var hits = search(searchBox.value);
        if (hits[0]) selectNode(hits[0].id);
        if (resultsEl) resultsEl.remove();
      }
    });

    document.querySelectorAll('[data-main-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.mainTab = btn.getAttribute('data-main-tab');
        setMainTabSelected(state.mainTab);
        render(state.data);
      });
    });
    document.querySelectorAll('[data-left-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.leftTab = btn.getAttribute('data-left-tab');
        document.querySelectorAll('[data-left-tab]').forEach(function (b) {
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        renderLeft(state.data);
      });
    });

    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-node]');
      if (t) {
        selectNode(t.getAttribute('data-node'));
        return;
      }
      var health = e.target.closest('[data-health]');
      if (health) {
        var key = health.getAttribute('data-health');
        state.filters.flags = null;
        state.filters.statuses = null;
        if (key === 'orphans') state.filters.flags = ['ORPHANED'];
        else if (key === 'unused') state.filters.flags = ['UNUSED'];
        else if (key === 'broken') state.filters.statuses = ['BROKEN'];
        else if (key === 'unknown') state.filters.statuses = ['UNKNOWN'];
        else if (key === 'security') state.filters.flags = ['SECURITY'];
        else if (key === 'findings') {
          state.mainTab = 'findings';
          setMainTabSelected('findings');
        }
        state.leftTab = 'filters';
        render(state.data);
        return;
      }
      var ft = e.target.closest('[data-filter-type]');
      if (ft) {
        state.filters.nodeTypes = [ft.getAttribute('data-filter-type')];
        render(state.data);
        return;
      }
      var ff = e.target.closest('[data-filter-feature]');
      if (ff) {
        state.filters.features = [ff.getAttribute('data-filter-feature')];
        state.mode = 'feature';
        $('mode-select').value = 'feature';
        render(state.data);
        return;
      }
      var copy = e.target.closest('[data-copy]');
      if (copy) {
        var text = copy.getAttribute('data-copy');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
        }
        return;
      }
      if (e.target.id === 'btn-clear-filters') {
        state.filters = { nodeTypes: null, edgeTypes: null, statuses: null, flags: null, layers: null, features: null, folders: null };
        render(state.data);
      }
    });

    document.addEventListener('change', function (e) {
      if (e.target.matches('[data-flag]')) {
        var flags = [];
        document.querySelectorAll('[data-flag]:checked').forEach(function (cb) {
          flags.push(cb.getAttribute('data-flag'));
        });
        state.filters.flags = flags.length ? flags : null;
        render(state.data);
      }
    });

    var host = $('graph-host');
    host.addEventListener('wheel', function (e) {
      e.preventDefault();
      var factor = e.deltaY < 0 ? 1.1 : 0.9;
      state.zoom = Math.min(3, Math.max(0.3, state.zoom * factor));
      if (state.mainTab === 'graph') render(state.data);
    }, { passive: false });

    host.addEventListener('pointerdown', function (e) {
      if (e.target.closest('[data-node]')) return;
      state.dragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      host.classList.add('dragging');
      host.setPointerCapture(e.pointerId);
    });
    host.addEventListener('pointermove', function (e) {
      if (!state.dragging) return;
      state.panX += e.clientX - state.lastX;
      state.panY += e.clientY - state.lastY;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      if (state.mainTab === 'graph') render(state.data);
    });
    host.addEventListener('pointerup', function () {
      state.dragging = false;
      host.classList.remove('dragging');
    });

    $('graph-panel').addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        state.selectedId = null;
        state.highlightPath = [];
        render(state.data);
      }
      if (e.key === 'Enter' && document.activeElement && document.activeElement.getAttribute('data-node')) {
        selectNode(document.activeElement.getAttribute('data-node'));
      }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) !== -1) {
        e.preventDefault();
        var step = 40;
        if (e.key === 'ArrowLeft') state.panX += step;
        if (e.key === 'ArrowRight') state.panX -= step;
        if (e.key === 'ArrowUp') state.panY += step;
        if (e.key === 'ArrowDown') state.panY -= step;
        if (state.mainTab === 'graph') render(state.data);
      }
      if (e.key === '+' || e.key === '=') {
        state.zoom = Math.min(3, state.zoom * 1.1);
        if (state.mainTab === 'graph') render(state.data);
      }
      if (e.key === '-') {
        state.zoom = Math.max(0.3, state.zoom * 0.9);
        if (state.mainTab === 'graph') render(state.data);
      }
    });

    window.addEventListener('resize', function () {
      if (state.mainTab === 'graph' && state.layout && state.layout.subset.nodes.length > SVG_LIMIT) {
        render(state.data);
      }
    });
  }

  function boot() {
    applyTheme();
    if (typeof window.ARCH_DATA !== 'object' || !window.ARCH_DATA) {
      document.body.innerHTML = '<main style="padding:2rem;font-family:system-ui">' +
        '<h1>Missing architecture-data.js</h1>' +
        '<p>Run <code>npm run architecture:viewer</code> or analyze a repo so ' +
        '<code>window.ARCH_DATA</code> is present, then open this file via <code>file://</code>.</p></main>';
      return;
    }
    state.data = window.ARCH_DATA;
    if ((state.data.nodes || []).length > LARGE_NODE_THRESHOLD) {
      state.mode = 'focus';
      $('mode-select').value = 'focus';
    } else {
      state.mode = 'full';
      $('mode-select').value = 'full';
    }
    var entry = findEntryNode(state.data);
    state.selectedId = entry ? entry.id : null;
    bindEvents();
    render(state.data);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
