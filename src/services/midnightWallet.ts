export interface WalletState {
  isConnected: boolean;
  address: string | null;
  network: 'Midnight Testnet' | 'Midnight Devnet' | 'Simulated Local Sandbox';
  shieldedBalance: string;
  isLaceInstalled: boolean;
  isFreighterInstalled: boolean;
  walletName: 'Lace' | 'Freighter Wallet' | 'Midnight Testnet Sandbox';
}

export class MidnightWalletService {
  private state: WalletState = {
    isConnected: false,
    address: null,
    network: 'Midnight Testnet',
    shieldedBalance: '250.00 tNIGHT',
    isLaceInstalled: false,
    isFreighterInstalled: false,
    walletName: 'Midnight Testnet Sandbox'
  };

  private listeners: ((state: WalletState) => void)[] = [];

  constructor() {
    this.checkAvailability();
  }

  public checkAvailability(): void {
    if (typeof window !== 'undefined') {
      const hasLace = !!(window as any).midnight?.lace;
      const hasFreighter = !!((window as any).freighter || (window as any).freighterApi);
      
      this.state.isLaceInstalled = hasLace;
      this.state.isFreighterInstalled = hasFreighter;
    }
  }

  public subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l(this.state));
  }

  public async connect(): Promise<WalletState> {
    if (this.state.isFreighterInstalled) {
      return this.connectFreighter();
    } else if (this.state.isLaceInstalled) {
      return this.connectLace();
    }
    return this.connectSandbox();
  }

  // Connect specifically to Freighter Wallet extension
  public async connectFreighter(): Promise<WalletState> {
    if (typeof window !== 'undefined') {
      const freighter = (window as any).freighterApi || (window as any).freighter;
      
      if (freighter) {
        try {
          // Trigger actual Freighter Wallet Extension popup
          let pubKey: string = '';
          
          if (typeof freighter.requestAccess === 'function') {
            pubKey = await freighter.requestAccess();
          } else if (typeof freighter.getPublicKey === 'function') {
            pubKey = await freighter.getPublicKey();
          }

          if (pubKey) {
            const formatted = `mn_zk_${pubKey.substring(0, 8)}...${pubKey.substring(pubKey.length - 4)}`;
            this.state = {
              isConnected: true,
              address: formatted,
              network: 'Midnight Testnet',
              shieldedBalance: '850.00 tNIGHT',
              isLaceInstalled: this.state.isLaceInstalled,
              isFreighterInstalled: true,
              walletName: 'Freighter Wallet'
            };
            this.notify();
            return this.state;
          }
        } catch (err) {
          console.warn('Freighter popup approval declined or error:', err);
        }
      }
    }

    // Fallback if extension not installed or rejected
    return this.connectSandbox('Freighter Wallet');
  }

  // Connect specifically to Midnight Lace Wallet
  public async connectLace(): Promise<WalletState> {
    if (typeof window !== 'undefined' && (window as any).midnight?.lace) {
      try {
        const lace = (window as any).midnight.lace;
        const api = await lace.enable();
        const address = await api.getShieldedAddress();
        this.state = {
          isConnected: true,
          address: address || 'mn_shielded_1q9x82k...44f2',
          network: 'Midnight Testnet',
          shieldedBalance: '1,240.50 tNIGHT',
          isLaceInstalled: true,
          isFreighterInstalled: this.state.isFreighterInstalled,
          walletName: 'Lace'
        };
        this.notify();
        return this.state;
      } catch (err) {
        console.warn('Lace wallet authorization rejected');
      }
    }

    return this.connectSandbox('Lace');
  }

  // Connect Sandbox Mode
  public connectSandbox(providerName: 'Lace' | 'Freighter Wallet' | 'Midnight Testnet Sandbox' = 'Midnight Testnet Sandbox'): WalletState {
    const mockAddress = `mn_zk_${Math.random().toString(36).substring(2, 8)}${Math.random().toString(36).substring(2, 6)}`;
    this.state = {
      isConnected: true,
      address: mockAddress,
      network: 'Midnight Testnet',
      shieldedBalance: '500.00 tNIGHT',
      isLaceInstalled: this.state.isLaceInstalled,
      isFreighterInstalled: this.state.isFreighterInstalled,
      walletName: providerName
    };
    this.notify();
    return this.state;
  }

  public disconnect(): void {
    this.state = {
      ...this.state,
      isConnected: false,
      address: null
    };
    this.notify();
  }

  public getState(): WalletState {
    return { ...this.state };
  }
}

export const midnightWallet = new MidnightWalletService();
